import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow State — developer analytics",
  description: "Privacy-first developer productivity analytics with a live presence layer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
