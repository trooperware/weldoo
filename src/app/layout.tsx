import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weldoo",
  description: "A vertical professional network for welders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
