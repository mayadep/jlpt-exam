import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "일본어 단어장",
  description: "JLPT N5 단어 플래시카드와 오답 복습",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "일본어 단어장", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="mx-auto min-h-full max-w-md px-4 pb-10 pt-4">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
