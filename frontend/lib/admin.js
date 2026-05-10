export function isAdmin(userId) {
  const ids = (process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}
