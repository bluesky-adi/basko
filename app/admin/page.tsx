"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export default function AdminPanel() {
  const [reports, setReports] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // 🛡️ SECURITY: Only YOU can see this
    if (user?.email !== "your-email@gmail.com") return window.location.href = "/"

    const { data } = await supabase.from('reports').select(`*, post:posts(*)`)
    setReports(data || [])
  }

  const nukePost = async (postId: string) => {
    if (window.confirm("Nuke this post?")) {
        await supabase.from('posts').delete().eq('id', postId)
        fetchReports()
    }
  }

  return (
    <div style={{ padding: '40px', background: '#000', minHeight: '100vh', color: 'white' }}>
      <h1>Basko Control Room ☢️</h1>
      {reports.map(r => (
        <div key={r.id} style={{ background: '#222', padding: '20px', margin: '10px 0', borderRadius: '12px' }}>
          <p><b>Reason:</b> {r.reason}</p>
          <p><b>Post Content:</b> {r.post?.content}</p>
          <button onClick={() => nukePost(r.post_id)} style={{ background: 'red', color: 'white', border: 'none', padding: '10px', borderRadius: '8px' }}>NUKE POST 🚀</button>
        </div>
      ))}
    </div>
  )
}