export function formatLinkedInFollowers(followers: number) {
  if (!Number.isSafeInteger(followers) || followers < 0) {
    throw new Error("LinkedIn followers must be a nonnegative safe integer");
  }
  const hundreds = Math.floor(followers / 100);
  const count = hundreds * 100;
  return {
    count,
    compact: `${hundreds / 10}K`,
    full: count.toLocaleString("en-US"),
  };
}
