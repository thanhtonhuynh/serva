export function googleOAuthStartHref(inviteToken?: string) {
  if (!inviteToken) return "/login/google";
  return `/login/google?invite=${encodeURIComponent(inviteToken)}`;
}
