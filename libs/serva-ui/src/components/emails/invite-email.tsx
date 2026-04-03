import { Column, Heading, Row, Text } from "@react-email/components";
import { getAuthUrl } from "@serva/shared";
import { SERVA_EMAIL_PRIMARY, ServaEmailPrimaryButton, ServaEmailShell } from "./serva-email-shell";

InviteEmail.PreviewProps = {
  inviterName: "Alex Doe",
  companyName: "THE COMPANY",
  profileType: "employee" as const,
  inviteeName: "John Doe",
  token: "preview-token",
  expiresInDays: 7,
};

export default function InviteEmail({
  inviterName,
  companyName,
  profileType,
  inviteeName,
  token,
  expiresInDays = 7,
}: {
  inviterName: string;
  companyName: string;
  profileType: "employee" | "operator";
  /** Name from the invite form for the welcome line; falls back to “there”. */
  inviteeName?: string | null;
  token: string;
  expiresInDays?: number;
}) {
  const inviteUrl = `${getAuthUrl().replace(/\/$/, "")}/invite/${token}`;
  const roleLabel = profileType === "employee" ? "Employee" : "Operator";
  const welcome = inviteeName?.trim() ? inviteeName.trim() : "there";
  const initial = inviterName.trim().charAt(0).toUpperCase() || "?";

  return (
    <ServaEmailShell
      preview={`${inviterName} invited you to join ${companyName} on Serva.`}
      fallbackUrl={inviteUrl}
      disclaimer={`This invitation link is unique to you. It expires in ${expiresInDays} days. If you were not expecting this email, you can ignore it.`}
    >
      <Row>
        <Column style={{ width: "48px", verticalAlign: "middle" }}>
          <Text
            style={{
              margin: "0",
              width: "40px",
              height: "40px",
              lineHeight: "40px",
              borderRadius: "20px",
              backgroundColor: "#DFD8F3",
              color: SERVA_EMAIL_PRIMARY,
              fontWeight: 700,
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            {initial}
          </Text>
        </Column>
        <Column style={{ verticalAlign: "middle", paddingLeft: "12px" }}>
          <Text className="m-0 text-[14px] leading-[22px]" style={{ color: "#525866" }}>
            <span style={{ color: "#1a1a1a", fontWeight: 600 }}>{inviterName}</span> sent you an
            invite
          </Text>
        </Column>
      </Row>

      <Heading
        as="h1"
        className="mt-8 mb-0 text-[22px] leading-[1.3] font-bold tracking-tight"
        style={{ color: "#1a1a1a" }}
      >
        Welcome, {welcome}!
      </Heading>

      <Text className="mt-4 mb-0 text-[15px] leading-[24px]" style={{ color: "#3d3d3d" }}>
        You have been invited to join <strong style={{ color: "#1a1a1a" }}>{companyName}</strong> on
        Serva as an <strong style={{ color: "#1a1a1a" }}>{roleLabel}</strong>. Serva is where your
        team runs schedules, reporting, and day-to-day operations in one place.
      </Text>
      <Text className="mt-3 mb-0 text-[15px] leading-[24px]" style={{ color: "#3d3d3d" }}>
        To get started, use the secure button below to accept your invitation and set up your
        account.
      </Text>

      <ServaEmailPrimaryButton href={inviteUrl}>Accept invitation</ServaEmailPrimaryButton>
    </ServaEmailShell>
  );
}
