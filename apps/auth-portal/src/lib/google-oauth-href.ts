export function googleOAuthStartHref(inviteToken?: string, callbackUrl?: string) {
  const params = new URLSearchParams();

  if (inviteToken && inviteToken.trim()) {
    params.set("invite", inviteToken.trim());
  }

  if (callbackUrl && callbackUrl.trim()) {
    params.set("callbackUrl", callbackUrl.trim());
  }

  const q = params.toString();
  return q ? `/login/google?${q}` : "/login/google";
}
