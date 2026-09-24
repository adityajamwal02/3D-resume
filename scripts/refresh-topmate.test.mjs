import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  isRefreshDue,
  parseProfile,
  PROFILE_URL,
  REFRESH_INTERVAL_MS,
  refreshSnapshot,
  validateSnapshot,
} from "./refresh-topmate.mjs";

const now = new Date("2026-09-24T10:00:00.000Z");
const feedback = [
  { property: "Helpful", total: 38 },
  { property: "Insightful", total: 31 },
  { property: "Friendly", total: 30 },
];

function profile({
  rating = 4.9,
  ratings = 65,
  bookings = "1,234",
  testimonials = 63,
  properties = feedback,
  url = PROFILE_URL,
} = {}) {
  const schema = {
    "@graph": [
      {
        "@type": "Person",
        url,
        aggregateRating: {
          bestRating: 5,
          ratingValue: rating,
          reviewCount: ratings,
        },
      },
      {
        "@type": "Service",
        aggregateRating: { ratingValue: 1, reviewCount: 2 },
      },
    ],
  };
  const payload = JSON.stringify({ liked_properties: properties });
  // Flight text can be split across script tags.
  const middle = Math.floor(payload.length / 2);
  const packets = [payload.slice(0, middle), payload.slice(middle)];
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>
    <span>${rating}<!-- -->/5</span><span>${ratings}<!-- --> ratings</span>
    <span>${bookings}</span><span>bookings</span>
    <span>${testimonials}</span><span>testimonials</span>
    ${packets.map((packet) => `<script>self.__next_f.push(${JSON.stringify([1, packet])})</script>`).join("")}`;
}

test("extracts profile-level ratings, bookings, testimonials and feedback", () => {
  assert.deepEqual(parseProfile(profile(), now), {
    source: PROFILE_URL,
    fetchedAt: now.toISOString(),
    rating: 4.9,
    ratings: 65,
    bookings: 1234,
    testimonials: 63,
    feedback: [
      { label: "Helpful", count: 38 },
      { label: "Insightful", count: 31 },
      { label: "Friendly", count: 30 },
    ],
  });
});

test("accepts genuine zero counts, without treating absent counts as zero", () => {
  const result = parseProfile(
    profile({
      rating: 0,
      ratings: 0,
      bookings: "0",
      testimonials: 0,
      properties: feedback.map((item) => ({ ...item, total: 0 })),
    }),
    now,
  );
  assert.equal(result.bookings, 0);
  assert.equal(result.ratings, 0);
  assert.equal(result.testimonials, 0);
});

for (const [name, html] of [
  ["wrong account", profile({ url: "https://topmate.io/someone-else" })],
  ["invalid rating", profile({ rating: 6 })],
  ["invalid ratings count", profile({ ratings: -1 })],
  ["missing booking badge", profile().replace(">bookings<", ">sessions<")],
  [
    "missing testimonial badge",
    profile().replace(">testimonials<", ">reviews<"),
  ],
  ["abbreviated booking count", profile({ bookings: "1.2K" })],
  ["unsafe integer", profile({ bookings: "9007199254740992" })],
  ["missing feedback count", profile({ properties: feedback.slice(1) })],
  [
    "negative feedback count",
    profile({
      properties: feedback.map((item) => ({ ...item, total: -1 })),
    }),
  ],
  [
    "mismatched visible ratings",
    profile().replace(">65<!-- -->", ">66<!-- -->"),
  ],
  ["challenge page", "<html>Verify you are human</html>"],
  ["malformed JSON", '<script type="application/ld+json">{broken}</script>'],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => parseProfile(html, now));
  });
}

test("refresh is due at exactly 72 hours, including month and year boundaries", () => {
  for (const fetchedAt of [
    "2026-09-24T10:00:00.000Z",
    "2026-12-31T10:00:00.000Z",
    "2028-02-28T10:00:00.000Z",
  ]) {
    const snapshot = { ...parseProfile(profile(), now), fetchedAt };
    const start = Date.parse(fetchedAt);
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
});

test("invalid or future timestamps fail explicitly", () => {
  const snapshot = parseProfile(profile(), now);
  assert.throws(() => isRefreshDue({ ...snapshot, fetchedAt: "invalid" }, now));
  assert.throws(() => isRefreshDue(snapshot, new Date(now.getTime() - 1)));
});

test("the checked-in snapshot has the expected data shape", async () => {
  validateSnapshot(
    JSON.parse(
      await readFile(
        new URL("../src/data/topmate.json", import.meta.url),
        "utf8",
      ),
    ),
  );
});

async function withSnapshot(run) {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-topmate-test-"));
  const path = join(directory, "topmate.json");
  const previous = JSON.stringify(
    parseProfile(profile(), new Date(now.getTime() - REFRESH_INTERVAL_MS)),
  );
  try {
    await writeFile(path, previous);
    await run(path, previous);
  } finally {
    await rm(directory, { recursive: true });
  }
}

test("successful refresh atomically persists new counts and the fetch date", async () => {
  await withSnapshot(async (path) => {
    const changed = await refreshSnapshot({
      path,
      now,
      ifDue: true,
      fetchProfile: async (url, options) => {
        assert.equal(url, PROFILE_URL);
        assert.ok(options.signal instanceof AbortSignal);
        return new Response(profile({ bookings: "140", testimonials: 70 }), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    });
    assert.equal(changed, true);
    const saved = JSON.parse(await readFile(path, "utf8"));
    assert.equal(saved.bookings, 140);
    assert.equal(saved.testimonials, 70);
    assert.equal(saved.fetchedAt, now.toISOString());
  });
});

test("fresh snapshots skip the network and remain byte-for-byte unchanged", async () => {
  await withSnapshot(async (path, previous) => {
    assert.equal(
      await refreshSnapshot({
        path,
        now: new Date(now.getTime() - 1),
        ifDue: true,
        fetchProfile: () => assert.fail("Must not fetch before 72 hours"),
      }),
      false,
    );
    assert.equal(await readFile(path, "utf8"), previous);
  });
});

for (const [name, fetchProfile] of [
  ["HTTP error", async () => new Response("Unavailable", { status: 503 })],
  [
    "network error",
    async () => {
      throw new Error("Network unavailable");
    },
  ],
  [
    "timeout",
    async () => {
      throw new DOMException("Timed out", "TimeoutError");
    },
  ],
  ["wrong content type", async () => new Response("{}")],
  [
    "changed markup",
    async () =>
      new Response("<html>Changed</html>", {
        headers: { "content-type": "text/html" },
      }),
  ],
]) {
  test(`${name} fails without overwriting the last verified snapshot`, async () => {
    await withSnapshot(async (path, previous) => {
      await assert.rejects(refreshSnapshot({ path, now, fetchProfile }));
      assert.equal(await readFile(path, "utf8"), previous);
    });
  });
}
