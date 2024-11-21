import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/providers";
import "./globals.css";
import { ProtectedRoute } from "@/components/auth/protected-route";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Jux Chat App",
  description: "Realtime chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
