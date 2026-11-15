import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "./PwaRegister";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#6e2d3a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://campuschemistry.in"),
  title: {
    default: "Campus Chemistry — verified campus connections",
    template: "%s | Campus Chemistry",
  },
  description: "A private, verified campus social network for IIT and NIT students. Meaningful friendships, opt-in dating (18+), clubs, and secure meetups.",
  keywords: ["IIT", "NIT", "campus network", "verified students", "college community", "campus meetups"],
  authors: [{ name: "Campus Chemistry Team" }],
  openGraph: {
    title: "Campus Chemistry — verified campus connections",
    description: "A private, verified campus social network for IIT and NIT students.",
    url: "https://campuschemistry.in",
    siteName: "Campus Chemistry",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Chemistry — verified campus connections",
    description: "A private, verified campus social network for IIT and NIT students.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Campus Chemistry",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
