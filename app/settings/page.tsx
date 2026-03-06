"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Moon, 
  Bell, 
  FileText, 
  HelpCircle,
  AlertTriangle
} from "lucide-react"

export default function Settings() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push("/")

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>

      <div className="p-4 space-y-6">
        
        {/* 1. User Profile Card */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <Avatar className="w-16 h-16 border-2 border-basko-brand">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
              {profile?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
             <h2 className="text-lg font-bold text-gray-900">{profile?.full_name || "Student"}</h2>
             <p className="text-sm text-gray-500">{profile?.college_name || "No College Info"}</p>
             
             {/* Verification Badge Logic */}
             <div className="mt-1">
               {profile?.is_verified ? (
                 <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <ShieldCheck className="w-3 h-3" /> Verified Student
                 </span>
               ) : (
                 <span 
                    onClick={() => router.push("/dashboard")} // Send them to upload ID
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 animate-pulse"
                 >
                    <AlertTriangle className="w-3 h-3" /> Verify Now
                 </span>
               )}
             </div>
          </div>
        </div>

        {/* 2. Account Settings */}
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Account</h3>
            
            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="text-gray-700 font-medium">Edit Profile</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <span className="text-gray-700 font-medium">Notifications</span>
                            </div>
                            <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">On</div>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <span className="text-gray-700 font-medium">Dark Mode</span>
                            </div>
                            <span className="text-xs text-gray-400">Coming soon</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* 3. Support & Legal */}
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Support</h3>
            
            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <span className="text-gray-700 font-medium">Help & Support</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-gray-700 font-medium">Terms & Privacy</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* 4. Logout Button */}
        <Button 
            variant="destructive" 
            className="w-full h-12 rounded-xl flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 shadow-none mt-4"
            onClick={handleLogout}
        >
            <LogOut className="w-5 h-5" />
            Log Out
        </Button>
        
        <p className="text-center text-xs text-gray-400 mt-4">Basko v1.0.0 • Made with ❤️ in India</p>

      </div>
    </div>
  )
}