"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import "./globals.css"
import "./claude.css"

// Icon Component for the Nav
const NavIcon = ({ d, active }: { d: string; active: boolean }) => (
  <svg 
    width="24" height="24" viewBox="0 0 24 24" 
    fill={active ? "var(--violet)" : "none"} 
    stroke={active ? "var(--violet)" : "var(--text3)"} 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

const NavIcons = {
  explore: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  trips: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [hasNotification, setHasNotification] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check for existing pending requests on load
      const { data } = await supabase
        .from('space_members')
        .select('id')
        .eq('status', 'pending')
        .limit(1)
      
      if (data && data.length > 0) setHasNotification(true)

      // 🔔 REALTIME: Watch for new rows in 'space_members'
      const channel = supabase
        .channel('realtime_notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'space_members' },
          (payload) => {
            // Only notify if someone ELSE is joining a trip (not you joining someone else's)
            console.log("New request received! 🔴")
            setHasNotification(true)
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    initNotifications()
  }, [supabase])

  // Automatically clear the red dot when the user visits the Dashboard
  useEffect(() => {
    if (pathname === '/dashboard') {
      setHasNotification(false)
    }
  }, [pathname])

  // Hide Nav on Auth pages (Login/Signup)
  const isAuthPage = pathname === "/" || pathname === "/auth/callback"

  return (
    <html lang="en">
      <head>
        <title>Basko | Student Travel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body>
        <div className="app-container">
          <main className="content-area">
            {children}
          </main>

          {!isAuthPage && (
            <nav className="bottom-nav">
              <Link href="/explore" className="nav-item">
                <NavIcon d={NavIcons.explore} active={pathname === '/explore'} />
                <span>Explore</span>
              </Link>

              <Link href="/trips" className="nav-item">
                <NavIcon d={NavIcons.trips} active={pathname === '/trips'} />
                <span>Trips</span>
              </Link>

              <Link href="/create" className="nav-create-btn">
                <div className="plus-icon">+</div>
              </Link>

              <Link href="/chat" className="nav-item">
                <NavIcon d={NavIcons.chat} active={pathname?.startsWith('/chat')} />
                <span>Chat</span>
              </Link>
              
              <Link href="/dashboard" className="nav-item" style={{ position: 'relative' }}>
                <NavIcon d={NavIcons.user} active={pathname === '/dashboard'} />
                <span>Profile</span>
                {hasNotification && (
                  <span className="notification-badge" />
                )}
              </Link>
            </nav>
          )}
        </div>
      </body>
    </html>
  )
}