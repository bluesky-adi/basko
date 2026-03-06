"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Lock, Mail, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  
  // NEW: State to handle "Forgot Password" view
  const [view, setView] = useState<"auth" | "forgot">("auth") 

  const router = useRouter()
  const supabase = createClient()

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push("/spaces")
    }
    checkUser()
  }, [router])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push("/spaces")
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert("Check your email to confirm signup!")
    setLoading(false)
  }

  // NEW: Reset Password Logic
  const handleResetPassword = async () => {
    if(!email) return alert("Please enter your email.")
    setLoading(true)
    
    // This sends a magic link to their email
    // ... inside handleResetPassword
const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // OLD: 'http://localhost:3000/update-password'
    // NEW: Point to the callback, which then redirects to update-password
    redirectTo: 'http://localhost:3000/auth/callback?next=/update-password',
})
// ...
   

    if (error) {
        alert("Error: " + error.message)
    } else {
        alert("Check your email for the password reset link!")
        setView("auth") // Go back to login
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      
      {/* VIEW 1: LOGIN / SIGNUP */}
      {view === "auth" && (
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="text-center space-y-1">
            <h1 className="text-3xl font-extrabold text-basko-brand tracking-tighter">Basko.</h1>
            <p className="text-gray-500 text-sm">The Student Travel Community</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="student@college.edu" onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Password</Label>
                    {/* BUTTON TO SWITCH TO FORGOT MODE */}
                    <button 
                        onClick={() => setView("forgot")}
                        className="text-xs text-basko-brand hover:underline font-medium"
                    >
                        Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="password" className="pl-9" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full bg-basko-brand hover:bg-basko-glow">
                  {loading ? <Loader2 className="animate-spin" /> : "Login ➜"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="student@college.edu" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Create a password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button onClick={handleSignUp} disabled={loading} variant="outline" className="w-full border-basko-brand text-basko-brand">
                  {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* VIEW 2: FORGOT PASSWORD */}
      {view === "forgot" && (
        <Card className="w-full max-w-md shadow-xl border-none">
             <CardHeader className="text-center">
                <h2 className="text-xl font-bold">Reset Password 🔐</h2>
                <p className="text-gray-500 text-xs">Enter your email to receive a reset link</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="student@college.edu" onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleResetPassword} disabled={loading} className="w-full bg-black text-white">
                  {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                </Button>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full gap-2" onClick={() => setView("auth")}>
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Button>
            </CardFooter>
        </Card>
      )}

    </div>
  )
}