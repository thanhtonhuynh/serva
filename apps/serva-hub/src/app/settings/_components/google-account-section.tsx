import { Button, Callout, Card, SIcon, Typography } from "@serva/serva-ui";
import { getAppBaseUrl } from "@serva/shared/config";

const LINK_ERROR_REASONS: Record<string, string> = {
  invalid: "The Google link flow expired or was invalid. Please try again.",
  config: "Google sign-in is not configured. Contact support if this persists.",
  token: "Could not complete linking with Google. Please try again.",
  no_id_token: "Google did not return a valid profile. Please try again.",
  unverified_email: "Verify your email with Google, then try linking again.",
  email_mismatch:
    "The Google account email must match your Serva account email.\nPlease try again with the correct email.",
  account_in_use: "This Google account is already linked to another Serva user.",
  already_linked:
    "Your Serva account is already linked to a different Google account. Contact support if you need to change it.",
  rate_limited: "Too many attempts. Please try again in a moment.",
};

type Props = {
  googleLinked: boolean;
  googleStatus?: "linked" | "link_error";
  linkErrorReason?: string | null;
};

export function GoogleAccountSection({ googleLinked, googleStatus, linkErrorReason }: Props) {
  const linkHref = `${getAppBaseUrl("auth-portal")}/account/link-google`;
  const errorMessage =
    googleStatus === "link_error" && linkErrorReason
      ? (LINK_ERROR_REASONS[linkErrorReason] ?? "Could not link Google. Please try again.")
      : null;

  return (
    <Card className="p-6">
      <Typography variant="h2">Google sign-in</Typography>

      {errorMessage && <Callout variant="error" message={errorMessage} />}

      {googleLinked ? (
        <div className="bg-accent/50 flex justify-between rounded-xl border p-4">
          <Typography className="flex items-center gap-2">
            <SIcon icon="GOOGLE" className="size-5" strokeWidth={1.5} />
            Your Serva account is linked to Google
          </Typography>

          <SIcon icon="CHECKMARK_CIRCLE" className="text-success size-5" strokeWidth={1.5} />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <Typography variant="p-sm" className="text-muted-foreground">
            Link your Google account for easy sign-in.
          </Typography>

          <Button
            variant="outline-accent"
            size="sm"
            className="w-fit"
            nativeButton={false}
            render={<a href={linkHref} />}
          >
            <SIcon icon="GOOGLE" strokeWidth={2} />
            <span>Link my Google account</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
