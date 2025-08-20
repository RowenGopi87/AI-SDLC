import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Layout } from "@/components/layout/layout";
import { DatabaseProvider } from "@/components/providers/database-provider-api";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/config";
import { ConditionalLayout } from "./conditional-layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
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
        <DatabaseProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </DatabaseProvider>
      </body>
    </html>
  );
}
