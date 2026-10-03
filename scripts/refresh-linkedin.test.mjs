import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { formatLinkedInFollowers } from "../src/linkedin.ts";
import {
  PROFILE_URL,
  REFRESH_INTERVAL_MS,
  MAX_PROFILE_BYTES,
  parseProfile,
  validateSnapshot,
  isRefreshDue,
  fetchPublicProfile,
  refreshSnapshot,
  LinkedInRefreshError,
} from "./refresh-linkedin.mjs";
import { refreshSnapshot as refreshTopmate } from "./refresh-topmate.mjs";

const now = new Date("2026-10-03T06:00:00.000Z");
const priorTime = new Date(now.getTime() - REFRESH_INTERVAL_MS).toISOString();
const prior = {
  source: PROFILE_URL,
  followers: 86676,
  fetchedAt: priorTime,
  lastAttemptedAt: priorTime,
  lastAttemptSucceeded: true,
};

function person(count = 86676, url = PROFILE_URL) {
  return {
    "@type": "Person",
    name: "Aditya Jamwal",
    url,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/FollowAction",
      userInteractionCount: count,
    },
  };
}
function html(entries = [person()]) {
  return `<html><script type="application/ld+json">${JSON.stringify({ "@graph": entries })}</script>
    <span>87K followers</span><span>500+ connections</span></html>`;
}
const response = (body = html()) =>
  new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });

test("rounds down at every thousand, not to the nearest thousand", () => {
  for (const [count, compact, full] of [
    [0, "0K", "0"],
    [999, "0K", "0"],
    [1000, "1K", "1,000"],
    [85999, "85K", "85,000"],
    [86000, "86K", "86,000"],
    [86676, "86K", "86,000"],
    [86999, "86K", "86,000"],
    [87000, "87K", "87,000"],
    [98352, "98K", "98,000"],
    [999999, "999K", "999,000"],
    [1000000, "1000K", "1,000,000"],
  ]) {
    assert.deepEqual(formatLinkedInFollowers(count), { compact, full });
  }
});

for (const value of [-1, 1.1, "86676", "86K", null, NaN, Infinity, 2 ** 53]) {
  test(`rejects invalid follower count ${String(value)}`, () => {
    assert.throws(() => formatLinkedInFollowers(value));
    assert.throws(() => parseProfile(html([person(value)])));
  });
}

test("extracts only the exact profile FollowAction, ignoring rounded badges and post likes", () => {
  const post = {
    "@type": "DiscussionForumPosting",
    author: person(),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: 999999,
    },
  };
  assert.equal(parseProfile(html([post, person(86676)])), 86676);
  assert.equal(
    parseProfile(
      html([person(98352, "https://in.linkedin.com/in/adityajamwal02/")]),
    ),
    98352,
  );
  assert.equal(parseProfile(html([person(0)])), 0);
});

test("accepts matching duplicate structured counts and statistics arrays", () => {
  const entry = person();
  entry.interactionStatistic = [
    {
      ...entry.interactionStatistic,
      interactionType: "http://schema.org/LikeAction",
      userInteractionCount: 123,
    },
    {
      ...entry.interactionStatistic,
      interactionType: "http://schema.org/FollowAction",
    },
  ];
  assert.equal(parseProfile(html([entry, person()])), 86676);
});

for (const [name, body] of [
  [
    "wrong profile",
    html([person(10, "https://www.linkedin.com/in/another-person")]),
  ],
  [
    "misleading host",
    html([
      person(10, "https://www.linkedin.com.evil.example/in/adityajamwal02"),
    ]),
  ],
  ["unrelated person", html([{ ...person(), name: "Someone else" }])],
  ["login page", "<html>Sign in to LinkedIn</html>"],
  ["rounded count only", "<span>87K followers</span>"],
  ["connections only", "<span>500+ connections</span>"],
  ["conflicting counts", html([person(86676), person(98352)])],
  [
    "missing count",
    html([person(undefined)]).replace(
      '"userInteractionCount":86676',
      '"differentCount":86676',
    ),
  ],
  [
    "malformed JSON",
    '<script type="application/ld+json">{remote body</script>',
  ],
  ["oversized HTML", "x".repeat(MAX_PROFILE_BYTES + 1)],
]) {
  test(`rejects ${name} rather than publishing an invented value`, () => {
    assert.throws(() => parseProfile(body));
  });
}

test("15-day polling boundary holds across month, year and leap-day boundaries", () => {
  for (const date of [
    "2026-10-03T00:00:00.000Z",
    "2026-12-25T00:00:00.000Z",
    "2028-02-20T00:00:00.000Z",
  ]) {
    const snapshot = { ...prior, fetchedAt: date, lastAttemptedAt: date };
    const start = Date.parse(date);
    assert.equal(
      isRefreshDue(snapshot, new Date(start + REFRESH_INTERVAL_MS - 1)),
      false,
    );
    assert.equal(
      isRefreshDue(snapshot, new Date(start + REFRESH_INTERVAL_MS)),
      true,
    );
    assert.equal(
      isRefreshDue(snapshot, new Date(start + REFRESH_INTERVAL_MS + 1)),
      true,
    );
  }
  assert.throws(() => isRefreshDue(prior, new Date(Date.parse(priorTime) - 1)));
  assert.throws(() => isRefreshDue(prior, new Date("invalid")));
  assert.throws(() =>
    validateSnapshot({ ...prior, lastAttemptedAt: "yesterday" }),
  );
});

test("fetches only the public profile, without credentials, cookies, or automatic redirects", async () => {
  const urls = [];
  let firstSignal;
  const result = await fetchPublicProfile(async (url, options) => {
    urls.push(url);
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "manual");
    assert.deepEqual(options.headers, { Accept: "text/html" });
    assert.ok(options.signal instanceof AbortSignal);
    if (!firstSignal) {
      firstSignal = options.signal;
      return new Response(null, {
        status: 302,
        headers: {
          location: "https://in.linkedin.com/in/adityajamwal02",
          "set-cookie": "must-not-forward=1",
        },
      });
    }
    assert.equal(options.signal, firstSignal);
    return response();
  });
  assert.deepEqual(urls, [
    PROFILE_URL,
    "https://in.linkedin.com/in/adityajamwal02",
  ]);
  assert.equal(parseProfile(result), 86676);
});

for (const destination of [
  "https://www.linkedin.com/login",
  "https://www.linkedin.com/authwall",
  "https://www.linkedin.com/in/another",
  "https://evil.example/profile",
  "http://www.linkedin.com/in/adityajamwal02",
  "https://user:password@www.linkedin.com/in/adityajamwal02",
  "https://www.linkedin.com:444/in/adityajamwal02",
  "https://www.linkedin.com/in/adityajamwal02?login=1",
  "http://169.254.169.254/metadata/identity/oauth2/token",
]) {
  test(`does not follow disallowed redirect ${destination}`, async () => {
    let requests = 0;
    await assert.rejects(
      fetchPublicProfile(async () => {
        requests++;
        return new Response(null, {
          status: 302,
          headers: { location: destination },
        });
      }),
      /outside the allowed public profile/,
    );
    assert.equal(requests, 1);
  });
}

test("bounds redirect loops and rejects oversized streamed responses", async () => {
  let requests = 0;
  await assert.rejects(
    fetchPublicProfile(async () => {
      requests++;
      return new Response(null, {
        status: 302,
        headers: { location: PROFILE_URL },
      });
    }),
    /Too many/,
  );
  assert.equal(requests, 4);
  await assert.rejects(
    fetchPublicProfile(async () => response("x".repeat(MAX_PROFILE_BYTES + 1))),
    /size limit/,
  );
});

async function withSnapshot(run) {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-linkedin-test-"));
  const path = join(directory, "linkedin.json");
  try {
    await writeFile(path, JSON.stringify(prior));
    await run(path, directory);
  } finally {
    await rm(directory, { recursive: true });
  }
}

test("successful update persists exact counts and shared display values", async () => {
  await withSnapshot(async (path, directory) => {
    assert.equal(
      await refreshSnapshot({
        path,
        now,
        ifDue: true,
        fetchProfile: async () => response(html([person(98352)])),
      }),
      true,
    );
    const saved = JSON.parse(await readFile(path, "utf8"));
    assert.deepEqual(saved, {
      source: PROFILE_URL,
      followers: 98352,
      fetchedAt: now.toISOString(),
      lastAttemptedAt: now.toISOString(),
      lastAttemptSucceeded: true,
    });
    assert.deepEqual(formatLinkedInFollowers(saved.followers), {
      compact: "98K",
      full: "98,000",
    });
    assert.deepEqual(await readdir(directory), ["linkedin.json"]);
  });
});

test("not-due checks skip every network request and leave the snapshot untouched", async () => {
  await withSnapshot(async (path) => {
    const before = await readFile(path, "utf8");
    assert.equal(
      await refreshSnapshot({
        path,
        now: new Date(now.getTime() - 1),
        ifDue: true,
        fetchProfile: () => assert.fail("Must not poll before 15 days"),
      }),
      false,
    );
    assert.equal(await readFile(path, "utf8"), before);
  });
});

for (const [name, fetchProfile] of [
  ["403", async () => new Response("", { status: 403 })],
  ["429", async () => new Response("", { status: 429 })],
  ["999", async () => ({ status: 999, ok: false, body: null })],
  [
    "network failure",
    async () => {
      throw new Error("Network unavailable");
    },
  ],
  [
    "timeout",
    async () => {
      throw new DOMException("Request timed out", "TimeoutError");
    },
  ],
  ["challenge HTML", async () => response("<html>Verify you are human</html>")],
  ["non-HTML", async () => new Response("{}")],
]) {
  test(`${name} preserves the verified count, reports failure, and waits 15 days before retrying`, async () => {
    await withSnapshot(async (path) => {
      await assert.rejects(
        refreshSnapshot({ path, now, ifDue: true, fetchProfile }),
        (error) =>
          error instanceof LinkedInRefreshError && error.snapshotUpdated,
      );
      const saved = JSON.parse(await readFile(path, "utf8"));
      assert.equal(saved.followers, prior.followers);
      assert.equal(saved.fetchedAt, prior.fetchedAt);
      assert.equal(saved.lastAttemptedAt, now.toISOString());
      assert.equal(saved.lastAttemptSucceeded, false);
      assert.equal(
        await refreshSnapshot({
          path,
          now: new Date(now.getTime() + 3600000),
          ifDue: true,
          fetchProfile: () =>
            assert.fail("No hourly retries on LinkedIn failure"),
        }),
        false,
      );
      assert.equal(
        await refreshSnapshot({
          path,
          now: new Date(now.getTime() + REFRESH_INTERVAL_MS),
          ifDue: true,
          fetchProfile: async () => response(),
        }),
        true,
      );
      assert.equal(
        JSON.parse(await readFile(path, "utf8")).lastAttemptSucceeded,
        true,
      );
    });
  });
}

test("a failed LinkedIn refresh does not prevent an independent Topmate refresh", async () => {
  await withSnapshot(async (path, directory) => {
    const topmatePath = join(directory, "topmate.json");
    await assert.rejects(
      refreshSnapshot({
        path,
        now,
        fetchProfile: async () => new Response("", { status: 403 }),
      }),
    );
    const topmateHTML = `<script type="application/ld+json">{"@type":"Person","url":"https://topmate.io/adityajamwal","aggregateRating":{"bestRating":5,"ratingValue":5,"reviewCount":65}}</script>
      <span>5/5</span><span>65 ratings</span><span>132</span><span>bookings</span><span>63</span><span>testimonials</span>
      <script>self.__next_f.push(${JSON.stringify([
        1,
        JSON.stringify({
          liked_properties: [
            { property: "Helpful", total: 38 },
            { property: "Insightful", total: 31 },
            { property: "Friendly", total: 30 },
          ],
        }),
      ])})</script>`;
    assert.equal(
      await refreshTopmate({
        path: topmatePath,
        now,
        fetchProfile: async () => response(topmateHTML),
      }),
      true,
    );
    assert.equal(JSON.parse(await readFile(topmatePath, "utf8")).bookings, 132);
    assert.equal(JSON.parse(await readFile(path, "utf8")).followers, 86676);
  });
});

test("checked-in LinkedIn snapshot is valid", async () => {
  validateSnapshot(
    JSON.parse(
      await readFile(
        new URL("../src/data/linkedin.json", import.meta.url),
        "utf8",
      ),
    ),
  );
});

test("malformed local state fails before any network request or write", async () => {
  await withSnapshot(async (path) => {
    await writeFile(path, "{invalid}");
    await assert.rejects(
      refreshSnapshot({
        path,
        now,
        ifDue: true,
        fetchProfile: () =>
          assert.fail("Must not request with invalid local state"),
      }),
    );
    assert.equal(await readFile(path, "utf8"), "{invalid}");
  });
});

test("initial failure does not create a fabricated snapshot", async () => {
  await withSnapshot(async (_path, directory) => {
    const path = join(directory, "new-profile.json");
    await assert.rejects(
      refreshSnapshot({
        path,
        now,
        fetchProfile: async () => new Response("", { status: 403 }),
      }),
      (error) =>
        error instanceof LinkedInRefreshError && !error.snapshotUpdated,
    );
    await assert.rejects(readFile(path), { code: "ENOENT" });
  });
});

test("manual refresh can bypass the interval but never changes the request target", async () => {
  await withSnapshot(async (path) => {
    const recent = {
      ...prior,
      fetchedAt: now.toISOString(),
      lastAttemptedAt: now.toISOString(),
    };
    await writeFile(path, JSON.stringify(recent));
    assert.equal(
      await refreshSnapshot({
        path,
        now,
        fetchProfile: async (url) => {
          assert.equal(url, PROFILE_URL);
          return response(html([person(86999)]));
        },
      }),
      true,
    );
    const saved = JSON.parse(await readFile(path, "utf8"));
    assert.equal(saved.followers, 86999);
    assert.equal(formatLinkedInFollowers(saved.followers).compact, "86K");
  });
});
