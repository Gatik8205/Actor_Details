import "./globals.css";
import type { Metadata } from "next";
import QueryWrapper from "./providers/QueryWrapper";

export const metadata: Metadata = {
  title: "IMDb Clone",
  description: "High-performance actor/movie browser built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryWrapper>
          {children}
        </QueryWrapper>
      </body>
    </html>
  );
}
