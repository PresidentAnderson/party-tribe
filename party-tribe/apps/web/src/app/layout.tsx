import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@party-tribe/api";
import { Navbar } from "@party-tribe/ui";

import { TRPCReactProvider } from "@/components/providers/trpc-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Party Tribe™ - The Ultimate Party Platform",
  description: "Discover amazing parties, join tribes, and connect with fellow party enthusiasts.",
  keywords: ["party", "events", "social", "networking", "organizer"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCReactProvider>
          <AuthProvider session={session}>
            <Navbar user={session?.user} />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}