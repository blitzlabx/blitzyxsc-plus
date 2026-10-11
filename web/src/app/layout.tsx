import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "blitzyxsc-plus — no-auth X/Twitter data API",
  description: "Fetch tweets, profiles, replies, trends, and followers — no API key, no OAuth, no developer console. By Blitz (blitzlabx).",
  keywords: ["blitzyxsc", "twitter api", "x api", "no-auth", "fxtwitter", "blitzlabx", "hono", "edge", "serverless"],
  authors: [{ name: "Blitz", url: "https://x.com/blitzlabx" }],
  creator: "Blitz (blitzlabx)",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "blitzyxsc-plus — no-auth X/Twitter data API",
    description: "Fetch tweets, profiles, replies, trends, and followers — no API key, no OAuth, no developer console. By Blitz (blitzlabx).",
    url: "https://blitzyxsc-plus.pages.dev",
    siteName: "blitzyxsc-plus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "blitzyxsc-plus",
    description: "No-auth X/Twitter data API by Blitz (blitzlabx).",
    creator: "@blitzlabx",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
