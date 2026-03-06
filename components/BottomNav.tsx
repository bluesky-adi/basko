"use client"

import { Home, Compass, PlusSquare, User, Settings } from "lucide-react" // Added Settings icon
import { usePathname, useRouter } from "next/navigation"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show nav on login or dashboard (onboarding) pages
  if (pathname === "/" || pathname === "/dashboard") return null

  const isActive = (path: string) => pathname === path ? "text-basko-brand" : "text-gray-400"

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 pb-safe">
      <button onClick={() => router.push("/feed")} className={`flex flex-col items-center gap-1 ${isActive("/feed")}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Feed</span>
      </button>

      <button onClick={() => router.push("/spaces")} className={`flex flex-col items-center gap-1 ${isActive("/spaces")}`}>
        <Compass className="w-6 h-6" />
        <span className="text-[10px] font-medium">Trips</span>
      </button>

      <button onClick={() => router.push("/create")} className="flex flex-col items-center -mt-6">
        <div className="bg-basko-brand text-white p-3 rounded-full shadow-lg border-4 border-white">
            <PlusSquare className="w-6 h-6" />
        </div>
      </button>

      <button onClick={() => router.push("/my-spaces")} className={`flex flex-col items-center gap-1 ${isActive("/my-spaces")}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">My Hub</span>
      </button>

      {/* NEW SETTINGS BUTTON */}
      <button onClick={() => router.push("/settings")} className={`flex flex-col items-center gap-1 ${isActive("/settings")}`}>
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-medium">Settings</span>
      </button>
    </div>
  )
}