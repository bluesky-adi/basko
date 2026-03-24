"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"login" | "signup" | "forgot">("login")

  const router = useRouter()
  const supabase = createClient()

  // Simplified Check: Only redirect if a session is explicitly found
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/explore")
    })
  }, [router, supabase.auth])

  const handleAuth = async () => {
    if (!email || !password) return alert("Please fill in all fields")
    setLoading(true)
    
    if (view === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else router.push("/explore")
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) alert(error.message)
      else alert("Check your email for a confirmation link! 📧")
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) alert("Google Login Error: " + error.message)
  }

  return (
    <div className="auth-page" style={{ height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card fade-up">
        <div className="auth-header">
          <h1 className="logo" style={{ fontSize: '42px', marginBottom: '8px' }}>Basko<span>.</span></h1>
          <p style={{ fontSize: '14px', color: 'var(--text3)' }}>
            {view === "login" ? "Welcome back, traveler ✨" : "Join the student community 🌍"}
          </p>
        </div>

        <div className="auth-form">
          <button onClick={handleGoogleLogin} className="google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="" />
            Continue with Google
          </button>

          <div className="divider"><span>or use email</span></div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="student@college.edu" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              {view === "login" && <span className="forgot-link" onClick={() => setView("forgot")}>Forgot?</span>}
            </div>
            <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button onClick={handleAuth} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? "Please wait..." : view === "login" ? "Login →" : "Create Account ✨"}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
              {view === "login" ? "New to Basko?" : "Already have an account?"}
              <button 
                onClick={() => setView(view === "login" ? "signup" : "login")}
                style={{ background: 'none', border: 'none', color: 'var(--violet)', fontWeight: '700', marginLeft: '6px', cursor: 'pointer' }}
              >
                {view === "login" ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}