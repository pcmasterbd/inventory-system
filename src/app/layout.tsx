import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Using Hind Siliguri for Bangla support
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind",
});

export const metadata: Metadata = {
  title: "PC MASTER BD",
  description: "Advanced inventory and financial management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
