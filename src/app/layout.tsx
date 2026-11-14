import type { Metadata } from "next";
import "./globals.css";
import { PwaRegister } from "./PwaRegister";

export const metadata: Metadata = {
  title: "Campus Chemistry — verified campus connections",
  description: "A private, verified campus social network for IIT and NIT students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><PwaRegister />{children}</body></html>;
}
