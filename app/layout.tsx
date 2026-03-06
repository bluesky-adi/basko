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
      <body className={`${inter.className} bg-[#e5e5e5] flex justify-center min-h-screen`}>
        {/* THE PHONE CONTAINER */}
        <main className="w-full max-w-[430px] bg-white min-h-screen relative shadow-2xl flex flex-col">
            <div className="flex-1 pb-20"> {/* Push content above bottom nav */}
               {children}
            </div>
            <BottomNav />
        </main>
      </body>
    </html>
  );
}