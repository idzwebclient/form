import type { Metadata, Viewport } from "next";
import PwaRegistration from "./PwaRegistration";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Qudani Forms",
  title: "Qudani Forms",
  description: "Jana dan cetak borang rasmi Qudani Jewels.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Qudani Forms",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/brand/qudani-logo-black.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121311",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
