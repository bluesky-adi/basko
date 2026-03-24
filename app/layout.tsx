"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, MapPin, MessageCircle, User, Plus } from "lucide-react"
import "./globals.css"
import "./claude.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [hasNotification, setHasNotification] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('space_members')
        .select('id')
        .eq('status', 'pending')
        .limit(1)
      
      if (data && data.length > 0) setHasNotification(true)

      const channel = supabase
        .channel('realtime_notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'space_members' }, () => {
          setHasNotification(true)
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    initNotifications()
  }, [supabase])

  useEffect(() => {
    if (pathname === '/dashboard') setHasNotification(false)
  }, [pathname])

  const isAuthPage = pathname === "/" || pathname === "/auth/callback"

  return (
    <html lang="en">
      <body style={{ background: "var(--bg)" }}>
        <div className="app-container">
          <main className="content-area">
            {children}
          </main>

          {!isAuthPage && (
            <nav className="bottom-nav">
              <Link href="/explore" className={`nav-item ${pathname === '/explore' ? 'active' : ''}`}>
                <Compass size={22} />
                <span>Explore</span>
              </Link>

              <Link href="/trips" className={`nav-item ${pathname === '/trips' ? 'active' : ''}`}>
                <MapPin size={22} />
                <span>Trips</span>
              </Link>

              <Link href="/create" className="nav-create-btn">
                <Plus size={28} />
              </Link>

              <Link href="/chat" className={`nav-item ${pathname?.startsWith('/chat') ? 'active' : ''}`}>
                <MessageCircle size={22} />
                <span>Chat</span>
              </Link>
              
              <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`} style={{ position: 'relative' }}>
                <User size={22} />
                <span>Profile</span>
                {hasNotification && <span className="notification-badge" />}
              </Link>
            </nav>
          )}
        </div>
      </body>
    </html>
  )
}