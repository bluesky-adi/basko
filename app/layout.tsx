import type { Metadata } from "next"
import "./claude.css" // BYPASSING TAILWIND
import BottomNav from "@/components/layout/bottom-nav" // THE NEW NAVIGATION

export const metadata: Metadata = {
  title: "Basko | Student Travel",
  description: "Find your squad, travel on a budget.",
}

// ✨ Claude's Glowing Orbs Background
function BgOrbs() {
  return (
    <>
      <div className="bg-orb" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(155,109,255,0.18) 0%, transparent 70%)", top: -80, right: -60, animation: "pulse-glow 6s ease-in-out infinite" }} />
      <div className="bg-orb" style={{ width: 250, height: 250, background: "radial-gradient(circle, rgba(240,167,216,0.12) 0%, transparent 70%)", top: 200, left: -80, animation: "pulse-glow 8s 2s ease-in-out infinite" }} />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* The main container from Claude's CSS */}
        <div className="app">
          <BgOrbs />
          
          {/* This is where your page content goes (Explore, Trips, etc.) */}
          {children}
          
          {/* The glowing global navigation bar */}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}