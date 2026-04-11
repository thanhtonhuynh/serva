import { googleOAuthStartHref } from "@/lib/google-oauth-href";
import { Button, SIcon } from "@serva/serva-ui";

type Props = {
  inviteToken?: string;
  callbackUrl?: string;
};

/** next/link would RSC-fetch this route; the handler redirects to Google and triggers browser CORS. */
export function GoogleSignInButton({ inviteToken, callbackUrl }: Props) {
  return (
    <Button
      variant="outline"
      className="w-full"
      nativeButton={false}
      render={<a href={googleOAuthStartHref(inviteToken, callbackUrl)} />}
    >
      <SIcon icon="GOOGLE" strokeWidth={1.5} />
      <span>Continue with Google</span>
    </Button>
  );
}
