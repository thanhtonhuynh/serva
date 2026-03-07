import {
  Body,
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
import React from "react";

ResetPasswordEmail.PreviewProps = {
  user: {
    name: "John Doe",
  },
  token: "123456",
};

export default function ResetPasswordEmail({
  user,
  token,
}: {
  user: { name: string };
  token: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        Hello {user.name}, Ongba EMS received a request to reset your password.
        Click the link to continue with the password reset process.
      </Preview>
      <Tailwind>
        <React.Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
              <Section className="mt-[32px] mb-[32px]">
                <Img
                  src={`${process.env.BASE_URL}/ongbaLogo.png`}
                  alt="Ongba EMS Logo"
                  className="mx-auto aspect-square h-[200px] w-[200px] object-cover"
                />

                <Text className="mb-8 text-[14px] leading-[24px] font-medium text-black">
                  Hello {user.name}, Ongba EMS received a request to reset your
                  password. If you didn't make the request, you can safely
                  ignore this email.
                </Text>

                <Text className="mb-8 text-[14px] leading-[24px] font-medium text-black">
                  Otherwise, click the following link to continue with the
                  password reset process:
                </Text>

                <Text className="text-[14px] leading-[24px] font-medium text-black">
                  <Link
                    href={`${process.env.BASE_URL}/reset-password/${token}`}
                    target="_blank"
                    className="rounded bg-black p-2 text-white underline"
                  >
                    Reset Password
                  </Link>
                </Text>

                <Text className="mt-8 text-[14px] leading-[24px] font-medium text-black">
                  This link will expire in 30 minutes.
                </Text>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="text-muted-foreground flex items-center justify-center text-[12px] leading-[24px]">
                &copy; {new Date().getFullYear()} Ongba EMS. All rights
                reserved.
              </Text>
            </Container>
          </Body>
        </React.Fragment>
      </Tailwind>
    </Html>
  );
}
