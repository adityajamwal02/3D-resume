export function formatLinkedInFollowers(followers: number) {
  if (!Number.isSafeInteger(followers) || followers < 0) {
    throw new Error("LinkedIn followers must be a nonnegative safe integer");
  }
  const thousands = Math.floor(followers / 1000);
  return {
    compact: `${thousands}K`,
    full: (thousands * 1000).toLocaleString("en-US"),
  };
}
