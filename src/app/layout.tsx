import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteName = "Rail";
const title = "Rail — Live Amtrak train status";
const description =
  "Unofficial live Amtrak status by route, station, and train. See delays, arrivals, and where trains are right now.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://127.0.0.1:3002");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: title,
    template: "%s · Rail",
  },
  description,
  keywords: [
    "Amtrak",
    "train status",
    "train tracker",
    "delays",
    "RailRat",
    "Amtraker",
  ],
  authors: [{ name: "Rail" }],
  creator: "Rail",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title,
    description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Rail — Live Amtrak train status",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E7EDF3" },
    { media: "(prefers-color-scheme: dark)", color: "#E7EDF3" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col atmosphere text-ink">
        <Suspense
          fallback={
            <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/90 px-4 py-3">
              <span className="font-display text-2xl font-bold text-ink">
                Rail
              </span>
            </header>
          }
        >
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense
          fallback={
            <footer className="mt-auto border-t border-line/70 bg-paper px-4 py-8 text-sm text-ink-soft">
              Loading…
            </footer>
          }
        >
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
