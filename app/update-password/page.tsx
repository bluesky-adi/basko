"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) alert(error.message)
    else {
      alert("Password updated! Logging you in... ✨")
      router.push("/explore")
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>New Password 🔒</h2>
        <div className="input-group">
          <label>Type your new password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button onClick={handleUpdate} className="btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Password →"}
        </button>
      </div>
    </div>
  )
}