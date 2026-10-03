import { appendFile, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { formatLinkedInFollowers } from "../src/linkedin.ts";

export const PROFILE_URL = "https://www.linkedin.com/in/adityajamwal02";
export const REFRESH_INTERVAL_MS = 15 * 24 * 60 * 60 * 1000;
export const MAX_PROFILE_BYTES = 2 * 1024 * 1024;
const snapshotPath = fileURLToPath(
  new URL("../src/data/linkedin.json", import.meta.url),
);

function isProfileURL(value) {
  if (typeof value !== "string") return false;
  const url = URL.parse(value);
  return (
    url !== null &&
    url.protocol === "https:" &&
    ["www.linkedin.com", "in.linkedin.com"].includes(url.hostname) &&
    ["/in/adityajamwal02", "/in/adityajamwal02/"].includes(url.pathname) &&
    !url.port &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash
  );
}

function timestamp(value) {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

export function validateSnapshot(data) {
  if (
    !data ||
    data.source !== PROFILE_URL ||
    !timestamp(data.fetchedAt) ||
    !timestamp(data.lastAttemptedAt) ||
    typeof data.lastAttemptSucceeded !== "boolean" ||
    Date.parse(data.lastAttemptedAt) < Date.parse(data.fetchedAt)
  ) {
    throw new Error(
      "Invalid LinkedIn snapshot source, timestamps, or refresh status",
    );
  }
  formatLinkedInFollowers(data.followers);
  return data;
}

export function isRefreshDue(snapshot, now = new Date()) {
  validateSnapshot(snapshot);
  const age = now.getTime() - Date.parse(snapshot.lastAttemptedAt);
  if (!Number.isFinite(age) || age < 0) {
    throw new Error("Invalid current time or future LinkedIn snapshot");
  }
  return age >= REFRESH_INTERVAL_MS;
}

export function parseProfile(html) {
  if (Buffer.byteLength(html) > MAX_PROFILE_BYTES) {
    throw new Error("LinkedIn profile exceeds the response size limit");
  }
  const schemas = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].flatMap((match) => {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch {
      throw new Error("Malformed LinkedIn structured data");
    }
    return Array.isArray(data) ? data : (data?.["@graph"] ?? [data]);
  });
  const counts = schemas
    .filter(
      (entry) =>
        entry?.["@type"] === "Person" &&
        entry.name === "Aditya Jamwal" &&
        isProfileURL(entry.url),
    )
    .flatMap((person) => {
      const stats = person.interactionStatistic;
      return Array.isArray(stats) ? stats : [stats];
    })
    .filter(
      (stat) =>
        stat?.["@type"] === "InteractionCounter" &&
        [
          "https://schema.org/FollowAction",
          "http://schema.org/FollowAction",
        ].includes(stat.interactionType),
    )
    .map((stat) => stat.userInteractionCount);
  if (!counts.length)
    throw new Error(
      "Exact follower count missing from the public LinkedIn profile",
    );
  for (const count of counts) formatLinkedInFollowers(count);
  if (new Set(counts).size !== 1)
    throw new Error("Conflicting LinkedIn follower counts");
  return counts[0];
}

export async function fetchPublicProfile(fetchProfile = fetch) {
  let url = PROFILE_URL;
  const signal = AbortSignal.timeout(30_000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const response = await fetchProfile(url, {
      headers: { Accept: "text/html" },
      credentials: "omit",
      redirect: "manual",
      signal,
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      const next = location ? URL.parse(location, url) : null;
      if (!next || !isProfileURL(next.href)) {
        throw new Error(
          "LinkedIn redirected outside the allowed public profile",
        );
      }
      url = next.href;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `Public LinkedIn profile returned HTTP ${response.status}`,
      );
    }
    if (
      !response.headers
        .get("content-type")
        ?.toLowerCase()
        .includes("text/html") ||
      !response.body
    ) {
      await response.body?.cancel();
      throw new Error("Public LinkedIn profile did not return HTML");
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_PROFILE_BYTES) {
          await reader.cancel();
          throw new Error("LinkedIn profile exceeds the response size limit");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw new Error("Too many public LinkedIn profile redirects");
}

export class LinkedInRefreshError extends Error {
  constructor(message, snapshotUpdated) {
    super(message);
    this.snapshotUpdated = snapshotUpdated;
  }
}

export async function refreshSnapshot({
  path = snapshotPath,
  ifDue = false,
  now = new Date(),
  fetchProfile = fetch,
} = {}) {
  let previous;
  try {
    previous = validateSnapshot(JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (previous && !isRefreshDue(previous, now) && ifDue) return false;
  const attemptedAt = now.toISOString();
  let snapshot;
  let failure;
  try {
    const followers = parseProfile(await fetchPublicProfile(fetchProfile));
    snapshot = {
      source: PROFILE_URL,
      followers,
      fetchedAt: attemptedAt,
      lastAttemptedAt: attemptedAt,
      lastAttemptSucceeded: true,
    };
  } catch (error) {
    failure =
      error instanceof Error ? error.message : "Public profile request failed";
    if (!previous) throw new LinkedInRefreshError(failure, false);
    snapshot = {
      ...previous,
      lastAttemptedAt: attemptedAt,
      lastAttemptSucceeded: false,
    };
  }
  validateSnapshot(snapshot);
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporaryPath, path);
  if (failure) throw new LinkedInRefreshError(failure, true);
  return true;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let changed = false;
  try {
    changed = await refreshSnapshot({
      ifDue: process.argv.includes("--if-due"),
    });
    console.log(
      changed
        ? "Updated public LinkedIn follower snapshot."
        : "LinkedIn refresh is not due.",
    );
  } catch (error) {
    changed = error instanceof LinkedInRefreshError && error.snapshotUpdated;
    console.error(
      "LinkedIn refresh failed; no follower count was replaced.",
      error.message,
    );
    process.exitCode = 1;
  }
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  }
}
