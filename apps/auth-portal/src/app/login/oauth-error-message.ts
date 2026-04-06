export function oauthLoginErrorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  switch (code) {
    case "rate_limited":
      return "Too many sign-in attempts. Please try again in a moment.";
    case "oauth_config":
      return "Google sign-in is not configured. Please use email and password or contact support.";
    case "oauth_invalid":
      return "Google sign-in session expired or was invalid. Please try again.";
    case "oauth_token":
      return "Could not complete Google sign-in. Please try again.";
    case "oauth_no_id_token":
      return "Google did not return a valid profile. Please try again.";
    case "oauth_unverified_email":
      return "Your Google account email is not verified. Verify it with Google, then try again.";
    case "invite":
      return "We could not apply your invite after Google sign-in. Check that your Google email matches the invited address.";
    case "oauth_link_required":
      return "Google sign-in is not activated for your Serva account.\nPlease sign in with your password and activate it in Account settings.";
    case "oauth_signup_required":
      return "No Serva account exists for this Google email yet. Create an account with email and password first, then you can connect Google in Account settings.";
    case "oauth_link_session":
      return "Your session expired while linking Google. Sign in again, then try Link Google from Account settings.";
    default:
      return "Google sign-in failed. Please try again.";
  }
}
