import { appendFile, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PROFILE_URL = "https://topmate.io/adityajamwal";
export const PROFILE_API =
  "https://api.topmate.io/fetchByUsername/?username=adityajamwal";
export const REFRESH_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;
const snapshotPath = fileURLToPath(
  new URL("../src/data/topmate.json", import.meta.url),
);

function count(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid Topmate ${name}: expected a nonnegative integer`);
  }
  return value;
}

export function validateSnapshot(data) {
  if (
    !data ||
    data.source !== PROFILE_URL ||
    typeof data.fetchedAt !== "string" ||
    !Number.isFinite(Date.parse(data.fetchedAt))
  ) {
    throw new Error("Invalid Topmate snapshot source or timestamp");
  }
  if (!Number.isFinite(data.rating) || data.rating < 0 || data.rating > 5) {
    throw new Error("Invalid Topmate rating: expected a number from 0 to 5");
  }
  count(data.ratings, "ratings");
  count(data.bookings, "bookings");
  count(data.testimonials, "testimonials");
  if (!Array.isArray(data.feedback) || data.feedback.length !== 3) {
    throw new Error("Missing Topmate feedback counts");
  }
  for (const [index, label] of [
    "Helpful",
    "Insightful",
    "Friendly",
  ].entries()) {
    const feedback = data.feedback[index];
    if (feedback?.label !== label) {
      throw new Error(`Missing Topmate ${label} feedback`);
    }
    count(feedback.count, label);
  }
  return data;
}

export function parseProfile(profile, now = new Date()) {
  if (
    profile?.username !== "adityajamwal" ||
    profile.show_rating_on_profile !== true ||
    profile.show_bookings_on_profile !== true ||
    profile.show_testimonials_on_profile !== true
  ) {
    throw new Error("Unexpected Topmate account or non-public statistics");
  }
  const feedback = profile.liked_properties;
  if (!Array.isArray(feedback)) throw new Error("Missing Topmate feedback");
  return validateSnapshot({
    source: PROFILE_URL,
    fetchedAt: now.toISOString(),
    rating: profile.avg_ratings,
    ratings: profile.ratings_count,
    bookings: profile.bookings_count,
    testimonials: profile.testimonials_count,
    feedback: ["Helpful", "Insightful", "Friendly"].map((label) => ({
      label,
      count: feedback.find((entry) => entry.property === label)?.total,
    })),
  });
}

export function isRefreshDue(snapshot, now = new Date()) {
  validateSnapshot(snapshot);
  const age = now.getTime() - Date.parse(snapshot.fetchedAt);
  if (age < 0) throw new Error("Topmate snapshot timestamp is in the future");
  return age >= REFRESH_INTERVAL_MS;
}

export async function refreshSnapshot({
  path = snapshotPath,
  ifDue = false,
  now = new Date(),
  fetchProfile = fetch,
} = {}) {
  if (ifDue) {
    const previous = JSON.parse(await readFile(path, "utf8"));
    if (!isRefreshDue(previous, now)) return false;
  }
  const response = await fetchProfile(PROFILE_API, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Topmate returned HTTP ${response.status}`);
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Topmate did not return profile JSON");
  }
  const snapshot = parseProfile(await response.json(), now);
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporaryPath, path);
  return true;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const changed = await refreshSnapshot({
      ifDue: process.argv.includes("--if-due"),
    });
    console.log(
      changed ? "Updated Topmate snapshot." : "Topmate snapshot is not due.",
    );
    if (process.env.GITHUB_OUTPUT) {
      await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    }
  } catch (error) {
    console.error(
      "Topmate refresh failed; existing snapshot was retained.",
      error,
    );
    process.exitCode = 1;
  }
}
