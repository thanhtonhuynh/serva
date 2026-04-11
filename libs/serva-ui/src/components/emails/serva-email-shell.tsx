import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { getAppBaseUrl } from "@serva/shared/config";
import React from "react";

/** Public file on the auth app (apps/auth-portal/public/serva-logo-full.png). Data-URI logos are stripped by Gmail and other clients. */
function servaEmailLogoUrl(): string {
  return `${getAppBaseUrl("auth-portal").replace(/\/$/, "")}/serva-logo-full.png`;
}

/** Serva primary-500 — readable on white and in buttons */
export const SERVA_EMAIL_PRIMARY = "#613DC2";
const CARD_BG = "#f2f4f7";
const LINE = "#e8eaed";
const MUTED = "#525866";
const FOOTER_FAINT = "#9ca3af";

export function ServaEmailPrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="mt-8 text-center">
      <Button
        href={href}
        style={{
          backgroundColor: SERVA_EMAIL_PRIMARY,
          color: "#ffffff",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "15px",
          lineHeight: "1.25",
          textDecoration: "none",
          textAlign: "center",
          display: "inline-block",
          padding: "14px 28px",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

type ServaEmailShellProps = {
  preview: string;
  children: React.ReactNode;
  fallbackUrl: string;
  /** Main reassurance line under the card (e.g. expiry or “ignore this email”). */
  disclaimer?: React.ReactNode;
};

export function ServaEmailShell({
  preview,
  children,
  fallbackUrl,
  disclaimer = (
    <>
      This link is meant only for you. If you did not expect this email, you can safely ignore it.
    </>
  ),
}: ServaEmailShellProps) {
  const webBase = getAppBaseUrl("serva-hub").replace(/\/$/, "");

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="mx-auto bg-white font-sans antialiased">
          <Container className="mx-auto max-w-[480px] px-4 py-10">
            <Section className="mb-8 text-center">
              <Img
                src={servaEmailLogoUrl()}
                alt="Serva"
                width={254}
                height={62}
                style={{ margin: "0 auto", height: "auto", maxWidth: "200px" }}
              />
            </Section>

            <Section
              className="rounded-2xl px-8 py-10"
              style={{ backgroundColor: CARD_BG, borderRadius: "16px" }}
            >
              {children}
            </Section>

            <Section className="mt-8 px-1">
              <Text className="m-0 text-center text-[13px] leading-[22px]" style={{ color: MUTED }}>
                {disclaimer}
              </Text>
              <Text
                className="mt-4 mb-0 text-center text-[13px] leading-[22px]"
                style={{ color: MUTED }}
              >
                If the button does not work, copy and paste this link into your browser:
              </Text>
              <Text className="mt-2 text-center text-[13px] leading-[22px] break-all">
                <Link href={fallbackUrl} style={{ color: SERVA_EMAIL_PRIMARY }}>
                  {fallbackUrl}
                </Link>
              </Text>
            </Section>

            <Hr
              className="my-8 border-0 border-t border-solid"
              style={{ borderColor: LINE, margin: "32px 0" }}
            />

            <Section className="text-center">
              <Text className="m-0 text-[12px] leading-[22px]" style={{ color: MUTED }}>
                <Link href={`${webBase}/`} style={{ color: SERVA_EMAIL_PRIMARY }}>
                  Home
                </Link>
                {" · "}
                <Link href={`${webBase}/`} style={{ color: SERVA_EMAIL_PRIMARY }}>
                  Open Serva
                </Link>
              </Text>
              <Text
                className="mt-3 mb-0 text-[11px] leading-[18px]"
                style={{ color: FOOTER_FAINT }}
              >
                © {new Date().getFullYear()} Serva
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
