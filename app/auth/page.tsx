"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // This helper exchanges the "code" in the URL for a real user session
      const { error } = await supabase.auth.getSession()
      if (!error) {
        router.push("/dashboard")
      } else {
        router.push("/auth")
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="fade-up" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--violet)' }}>Authenticating... 🔐</h2>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Setting up your Basko profile</p>
      </div>
    </div>
  )
}