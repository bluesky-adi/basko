"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Map, PlusSquare, MessageSquare, LayoutDashboard, Menu } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Trips", href: "/trips", icon: Map },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageSquare },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: Logo */}
          <Link href="/explore" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">B</div>
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">Basko</span>
          </Link>

          {/* CENTER/RIGHT: Desktop Navigation (Hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? "text-violet-600 dark:text-violet-400" 
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* FAR RIGHT: Actions */}
          <div className="flex items-center gap-4">
            <Link 
                href="/create" 
                className="hidden md:flex bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm items-center gap-2"
            >
              <PlusSquare className="w-4 h-4" /> Create
            </Link>
            
            {/* Mobile Hamburger Menu (Shows only on phones) */}
            <button className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}