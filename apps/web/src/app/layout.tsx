import { AppSidebar } from "@/components/app-sidebar";
import { TailwindScreenSizeIndicator } from "@/components/dev/tw-screen-size-indicator";
import { SidebarInset, SidebarProvider } from "@serva/ui/components/sidebar";
import { SessionProvider } from "@/contexts/SessionProvider";
import { getCurrentSession } from "@/lib/auth/session";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "@serva/ui/globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = { title: "Serva" };

export const viewport: Viewport = { maximumScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { session, identity, companyCtx } = await getCurrentSession();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="font-space-grotesk antialiased">
        <SessionProvider session={session} identity={identity} companyCtx={companyCtx}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="overflow-x-auto md:peer-data-[variant=floating]:m-2 md:peer-data-[variant=floating]:ml-0 md:peer-data-[variant=floating]:peer-data-[state=collapsed]:ml-1">
              <div className="mb-10 flex flex-1 flex-col">{children}</div>
              <Toaster richColors />
            </SidebarInset>
          </SidebarProvider>
        </SessionProvider>
        <TailwindScreenSizeIndicator />
      </body>
    </html>
  );
}
