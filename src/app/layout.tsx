import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { de } from "@/lib/i18n/de";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: de.app.name,
    template: `%s – ${de.app.name}`,
  },
  description: de.app.tagline,
  applicationName: de.app.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: de.app.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e7490",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
