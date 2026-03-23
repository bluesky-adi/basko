import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Basko",
  description: "Student Travel Community",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex justify-center items-start`}
      >
        {/* 🌌 CINEMATIC BACKGROUND */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#1a1a2e,_#0f111a)]" />

        {/* 🌟 MAIN APP CONTAINER */}
        <main
          className="
          w-full 
          max-w-[480px] 
          min-h-screen 
          flex flex-col 
          relative 
          border-x border-white/10
          backdrop-blur-xl
        "
        >
          {/* CONTENT AREA */}
          <div className="flex-1 pb-20 px-4 pt-4">
            {children}
          </div>

          {/* BOTTOM NAV */}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}