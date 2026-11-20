import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  isRefreshDue,
  parseProfile,
  PROFILE_URL,
  PROFILE_API,
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
  bookings = 1234,
  testimonials = 63,
  properties = feedback,
  username = "adityajamwal",
} = {}) {
  return {
    username,
    avg_ratings: rating,
    ratings_count: ratings,
    bookings_count: bookings,
    testimonials_count: testimonials,
    liked_properties: properties,
    show_rating_on_profile: true,
    show_bookings_on_profile: true,
    show_testimonials_on_profile: true,
  };
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
      bookings: 0,
      testimonials: 0,
      properties: feedback.map((item) => ({ ...item, total: 0 })),
    }),
    now,
  );
  assert.equal(result.bookings, 0);
  assert.equal(result.ratings, 0);
  assert.equal(result.testimonials, 0);
});

for (const [name, data] of [
  ["wrong account", profile({ username: "someone-else" })],
  ["invalid rating", profile({ rating: 6 })],
  ["invalid ratings count", profile({ ratings: -1 })],
  ["hidden bookings", { ...profile(), show_bookings_on_profile: false }],
  ["missing testimonials", { ...profile(), testimonials_count: undefined }],
  ["abbreviated booking count", profile({ bookings: "1.2K" })],
  ["unsafe integer", profile({ bookings: 2 ** 53 })],
  ["missing feedback count", profile({ properties: feedback.slice(1) })],
  [
    "negative feedback count",
    profile({
      properties: feedback.map((item) => ({ ...item, total: -1 })),
    }),
  ],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => parseProfile(data, now));
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
        assert.equal(url, PROFILE_API);
        assert.ok(options.signal instanceof AbortSignal);
        return Response.json(profile({ bookings: 140, testimonials: 70 }));
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
    "malformed JSON",
    async () =>
      new Response("<html>Changed</html>", {
        headers: { "content-type": "application/json" },
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
