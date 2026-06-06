import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Newsletter Distribution Economics | Real Rails POC-53",
  description:
    "Production-style demo exploring subscriber cohorts, referral loops, deliverability, and sponsorship revenue for independent newsletter distribution rails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-obsidian`}>
        {children}
      </body>
    </html>
  );
}
