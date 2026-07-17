import type { Metadata, Viewport } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AIPanel } from "@/components/layout/AIPanel";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "AI 工作台",
  description: "面向产品经理的个人效率工具",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "AI 工作台",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen bg-bg antialiased">
        <div className="flex h-screen">
          {/* PC Sidebar — hidden on mobile, visible from md */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 pb-20 md:pb-6">
              {children}
            </div>
          </main>

          {/* AI Panel — hidden on mobile, visible from md (sticky 320px/380px) */}
          <AIPanel />
        </div>

        {/* Mobile Bottom Navigation — visible on mobile, hidden from md */}
        <BottomNav />

        {/* Toast notifications */}
        <ToastProvider />
      </body>
    </html>
  );
}
