import "@serva/serva-ui/globals.css";
import type { Metadata, Viewport } from "next";
import { Fira_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = { title: "Serva — Sign In" };

export const viewport: Viewport = { maximumScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${firaSans.variable} scroll-smooth`}
    >
      <body className="font-fira-sans relative flex min-h-screen w-full flex-1 flex-col antialiased">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
