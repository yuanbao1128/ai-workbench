import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 工作台",
  description: "面向产品经理的个人效率工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-bg antialiased">
        <div className="flex h-screen">
          {/* PC Sidebar */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 pb-20 md:pb-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  );
}