"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const Icon = ({ d, size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const Icons = {
  compass: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0v0M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z",
  plus: "M12 5v14M5 12h14",
  messageCircle: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
}

export default function BottomNav() {
  const pathname = usePathname()

  // ✨ NEW: Hide BottomNav if we are inside a specific chat room (e.g., /chat/123)
  // But KEEP it visible on the main /chat list page
  if (pathname.startsWith('/chat/') && pathname.length > 6) {
    return null;
  }

  // We now have 5 icons: Explore, Trips, Create, Chat, Dashboard
  const items = [
    { id: "explore", path: "/explore", icon: Icons.compass, label: "Explore" },
    { id: "trips", path: "/trips", icon: Icons.map, label: "Trips" },
    { id: "create", path: "/create", icon: Icons.plus, label: "Create" },
    { id: "chat", path: "/chat", icon: Icons.messageCircle, label: "Chat" },
    { id: "dashboard", path: "/dashboard", icon: Icons.grid, label: "Dashboard" },
  ]

  return (
    <div className="bottom-nav" style={{ justifyContent: "space-between", padding: "12px 24px 24px" }}>
      {items.map(item => {
        // Only highlight if it's the exact path or a sub-path (like /chat/123)
        const isActive = pathname.startsWith(item.path) || (item.id === 'chat' && pathname.includes('/chat'))
        return (
          <Link href={item.path} key={item.id} className={`nav-item ${isActive ? "active" : ""}`}>
            <div className="nav-icon-wrap">
              <Icon d={item.icon} />
            </div>
            <span style={{ fontSize: "9px" }}>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}