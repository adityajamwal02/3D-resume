import { appendFile, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PROFILE_URL = "https://topmate.io/adityajamwal";
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

export function parseProfile(html, now = new Date()) {
  const schemas = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].flatMap((match) => {
    const schema = JSON.parse(match[1]);
    return schema["@graph"] ?? [schema];
  });
  const person = schemas.find(
    (schema) => schema["@type"] === "Person" && schema.url === PROFILE_URL,
  );
  if (!person?.aggregateRating || person.aggregateRating.bestRating !== 5) {
    throw new Error(
      "Topmate profile identity or five-star rating schema changed",
    );
  }

  // Read public profile badges, never sum per-service booking counts.
  const markup = html.replace(/<!--[\s\S]*?-->/g, "");
  function badge(label) {
    const match = markup.match(
      new RegExp(
        `<span\\b[^>]*>\\s*([\\d,]+)\\s*</span>\\s*<span\\b[^>]*>\\s*${label}\\s*</span>`,
        "i",
      ),
    );
    if (!match) throw new Error(`Topmate ${label} badge is missing`);
    return count(Number(match[1].replaceAll(",", "")), label);
  }

  // Decode the public Next.js data as JSON; never evaluate remote JavaScript.
  const hydration = [
    ...html.matchAll(/self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)/g),
  ]
    .map((match) => JSON.parse(match[1])[1])
    .join("");
  const properties = hydration.match(/"liked_properties"\s*:\s*(\[[^\]]*\])/);
  if (!properties) throw new Error("Topmate feedback data is missing");
  const feedback = JSON.parse(properties[1]);
  if (!Array.isArray(feedback))
    throw new Error("Invalid Topmate feedback data");

  const rating = person.aggregateRating.ratingValue;
  const ratings = person.aggregateRating.reviewCount;
  const visibleRating = markup.match(
    /<span\b[^>]*>\s*([\d.]+)\s*\/5\s*<\/span>\s*<span\b[^>]*>\s*([\d,]+)\s+ratings\s*<\/span>/i,
  );
  if (
    !visibleRating ||
    Number(visibleRating[1]) !== rating ||
    Number(visibleRating[2].replaceAll(",", "")) !== ratings
  ) {
    throw new Error("Topmate visible ratings disagree with the profile schema");
  }
  return validateSnapshot({
    source: PROFILE_URL,
    fetchedAt: now.toISOString(),
    rating,
    ratings,
    bookings: badge("bookings"),
    testimonials: badge("testimonials"),
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
  const response = await fetchProfile(PROFILE_URL, {
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Topmate returned HTTP ${response.status}`);
  if (!response.headers.get("content-type")?.includes("text/html")) {
    throw new Error("Topmate did not return an HTML profile");
  }
  const snapshot = parseProfile(await response.text(), now);
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
