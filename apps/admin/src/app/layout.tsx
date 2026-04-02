import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider } from "@/contexts/SessionProvider";
import { getCurrentSession } from "@serva/auth";
import { SidebarInset, SidebarProvider, TailwindScreenSizeIndicator } from "@serva/serva-ui";
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

export const metadata: Metadata = { title: "Serva — Admin" };

export const viewport: Viewport = { maximumScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { session, identity } = await getCurrentSession();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${firaSans.variable} scroll-smooth`}
    >
      <body className="font-fira-sans antialiased">
        <SessionProvider session={session} identity={identity}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="overflow-x-auto md:peer-data-[variant=floating]:m-2 md:peer-data-[variant=floating]:ml-0 md:peer-data-[variant=floating]:peer-data-[state=collapsed]:ml-1">
              <div className="relative mb-10 flex flex-1 flex-col">{children}</div>
              <Toaster richColors />
            </SidebarInset>
          </SidebarProvider>
        </SessionProvider>
        <TailwindScreenSizeIndicator />
      </body>
    </html>
  );
}
