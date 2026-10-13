import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://propsync-test.vercel.app";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PropSync | Property Listings, GIS Cadastral Maps & WhatsApp AI Parser",
    template: "%s | PropSync",
  },
  description:
    "The modern command center for land and commercial real estate brokers. Sync spreadsheet listings to Google Maps, draw cadastral parcel boundaries, and parse WhatsApp messages straight into structured deals.",
  keywords: [
    "commercial real estate software",
    "land broker tools",
    "GIS cadastral parcel boundary drawer",
    "real estate whatsapp extractor",
    "property listing map manager",
    "google maps property sync",
    "commercial real estate CRM",
    "geran tanah vault",
    "land acreage calculator",
  ],
  authors: [{ name: "PropSync Team" }],
  creator: "PropSync",
  publisher: "PropSync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PropSync",
    title: "PropSync | Property Listings, GIS Cadastral Maps & WhatsApp AI Parser",
    description:
      "Map your listings, sync the sheet, and extract deals straight from WhatsApp. Built for commercial brokers and land agencies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PropSync - Real Estate GIS and WhatsApp Ingestion Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropSync | Property Listings, GIS Cadastral Maps & WhatsApp AI Parser",
    description:
      "Map your listings, sync the sheet, and extract deals straight from WhatsApp. Built for commercial brokers and land agencies.",
    images: ["/og-image.png"],
    creator: "@propsync",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "0c10a14c686ec60b",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen bg-gray-100 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}