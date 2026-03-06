"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // <--- State for Eye Icon
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  // 1. Safety Check: Are we actually logged in?
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            alert("Session expired or invalid. Please request a new reset link.")
            router.push("/")
        }
        setVerifying(false)
    }
    checkSession()
  }, [])

  const handleUpdate = async () => {
    if (!password) return alert("Please enter a new password.")
    setLoading(true)

    // Update the user's password
    const { error } = await supabase.auth.updateUser({ 
        password: password 
    })

    if (error) {
        alert("Error: " + error.message)
    } else {
        alert("Password updated successfully! Redirecting...")
        router.push("/") // Send them back to login
    }
    setLoading(false)
  }

  if (verifying) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-basko-brand">Set New Password 🔐</h1>
            <p className="text-gray-500 text-sm">Enter your new password below.</p>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    
                    {/* Password Input with Dynamic Type */}
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        className="pl-9 pr-10" 
                        placeholder="••••••••" 
                        onChange={(e) => setPassword(e.target.value)} 
                    />

                    {/* EYE ICON BUTTON */}
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            <Button 
                onClick={handleUpdate} 
                disabled={loading} 
                className="w-full h-12 text-lg font-bold bg-black text-white hover:bg-gray-800 shadow-lg mt-4"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "💾 Save New Password"}
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}