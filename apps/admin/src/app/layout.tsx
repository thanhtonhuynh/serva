import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider } from "@/contexts/SessionProvider";
import { platformAdminGuard } from "@serva/auth/authorize";
import { getCurrentSession } from "@serva/auth/session";
import { SidebarInset, SidebarProvider, TailwindScreenSizeIndicator } from "@serva/serva-ui";
import "@serva/serva-ui/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = { title: "Serva — Admin" };

export const viewport: Viewport = { maximumScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await platformAdminGuard();
  const { session, identity } = await getCurrentSession();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="font-space-grotesk antialiased">
        <SessionProvider session={session} identity={identity}>
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
