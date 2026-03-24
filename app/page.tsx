"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Loader2, Lock, Mail, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"auth" | "forgot">("auth")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push("/explore")
    }
    checkUser()
  }, [router])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push("/explore")
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert("Check your email to confirm signup!")
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) return alert("Enter email")

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/callback?next=/update-password',
    })

    if (error) alert(error.message)
    else {
      alert("Check your email!")
      setView("auth")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">

      {/* 🌌 BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#1a1a2e,_#0f111a)]" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full -z-10" />

      {/* CARD */}
      <div className="
        w-full max-w-md
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        p-6
        shadow-xl
      ">

        {/* TITLE */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            Basko<span className="text-purple-400">.</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            The Student Travel Community
          </p>
        </div>

        {/* AUTH VIEW */}
        {view === "auth" && (
          <div className="space-y-4">

            {/* EMAIL */}
            <div>
              <p className="text-sm mb-1">Email</p>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  placeholder="student@college.edu"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <p>Password</p>
                <button onClick={() => setView("forgot")} className="text-purple-400 text-xs">
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <button
              onClick={handleLogin}
              className="w-full bg-purple-500 hover:bg-purple-600 transition py-3 rounded-xl"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Login →"}
            </button>

            <button
              onClick={handleSignUp}
              className="w-full border border-white/10 py-3 rounded-xl text-sm"
            >
              Create Account
            </button>

          </div>
        )}

        {/* FORGOT VIEW */}
        {view === "forgot" && (
          <div className="space-y-4">

            <h2 className="text-lg font-semibold text-center">Reset Password</h2>

            <input
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-purple-500 py-3 rounded-xl"
            >
              Send Reset Link
            </button>

            <button
              onClick={() => setView("auth")}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

          </div>
        )}

      </div>
    </div>
  )
}