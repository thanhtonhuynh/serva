import { Heading, Text } from "@react-email/components";
import { getAuthUrl } from "@serva/shared";
import { ServaEmailPrimaryButton, ServaEmailShell } from "./serva-email-shell";

ResetPasswordEmail.PreviewProps = {
  identity: {
    name: "John Doe",
  },
  token: "123456",
};

export default function ResetPasswordEmail({
  identity,
  token,
}: {
  identity: { name: string };
  token: string;
}) {
  const resetUrl = `${getAuthUrl().replace(/\/$/, "")}/reset-password/${token}`;

  return (
    <ServaEmailShell
      preview={`${identity.name}, reset your Serva password with this secure link.`}
      fallbackUrl={resetUrl}
      disclaimer="This link expires in 30 minutes and can only be used once. If you did not request a reset, you can ignore this email."
    >
      <Heading
        as="h1"
        className="m-0 text-[22px] leading-[1.3] font-bold tracking-tight"
        style={{ color: "#1a1a1a" }}
      >
        Reset your password
      </Heading>

      <Text className="mt-4 mb-0 text-[15px] leading-[24px] font-bold" style={{ color: "#3d3d3d" }}>
        Hello {identity.name},
      </Text>
      <Text className="mt-3 mb-0 text-[15px] leading-[24px]" style={{ color: "#3d3d3d" }}>
        We received a request to reset the password for your Serva account. Use the button below to
        choose a new password.
      </Text>
      <Text className="mt-3 mb-0 text-[15px] leading-[24px]" style={{ color: "#3d3d3d" }}>
        If you did not make this request, no action is needed and your password will stay the same.
      </Text>

      <ServaEmailPrimaryButton href={resetUrl}>Reset password</ServaEmailPrimaryButton>
    </ServaEmailShell>
  );
}
