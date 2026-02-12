import type { Metadata } from "next";
import { Noto_Sans_SC, Space_Grotesk } from "next/font/google";

import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const sansFont = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-cn",
});

export const metadata: Metadata = {
  title: "情感迷雾破解者",
  description: "让你的 SecondMe AI 在 8 关博弈中成长为情感边界顾问",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${displayFont.variable} ${sansFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
