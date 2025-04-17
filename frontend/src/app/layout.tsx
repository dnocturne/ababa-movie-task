import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/redux/providers";

export const metadata: Metadata = {
  title: "My Movie List",
  description: "A personal collection of favorite movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
