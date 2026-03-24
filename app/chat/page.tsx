"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const Icon = ({ d, size = 22 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  messageCircle: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
}

export default function ChatIndexPage() {
  const [chatRooms, setChatRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchMyChats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get trips the user HOSTS
      const { data: hosted } = await supabase
        .from('spaces')
        .select('id, title, destination_city')
        .eq('host_id', user.id)
        .eq('status', 'active')

      // 2. Get trips the user JOINED (and is approved for)
      const { data: joined } = await supabase
        .from('space_members')
        .select(`space:spaces(id, title, destination_city)`)
        .eq('user_id', user.id)
        .eq('status', 'approved')

      // Combine and format the lists
      const myHostedRooms = hosted || []
      // @ts-ignore
      const myJoinedRooms = (joined || []).map(j => j.space).filter(s => s !== null)

      setChatRooms([...myHostedRooms, ...myJoinedRooms])
      setLoading(false)
    }

    fetchMyChats()
  }, [])

  return (
    <div className="page">
      <div className="navbar" style={{ justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Messages 💬</span>
      </div>

      <div style={{ padding: "24px 16px" }}>
        
        <div className="fade-up">
          <h1 className="section-heading mb-6">Your Squads</h1>
        </div>

        {loading ? (
          <div className="text-center text-[var(--text3)] text-sm mt-10">Loading chats...</div>
        ) : chatRooms.length === 0 ? (
          <div className="glass p-8 text-center fade-up-1" style={{ borderRadius: "var(--radius-sm)" }}>
            <Icon d={Icons.messageCircle} size={32} />
            <div style={{ marginTop: 12, color: "var(--text3)", fontSize: 14 }}>
              It's quiet here. Join or create a trip to start chatting!
            </div>
          </div>
        ) : (
          <div className="space-y-3 fade-up-1">
            {chatRooms.map((room) => (
              <div 
                key={room.id} 
                onClick={() => router.push(`/chat/${room.id}`)}
                className="glass p-4" 
                style={{ 
                  borderRadius: "var(--radius-sm)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, background 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--surface2)"}
                onMouseOut={(e) => e.currentTarget.style.background = "var(--surface)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar" style={{ background: "linear-gradient(135deg, var(--violet), var(--pink))", color: "white", border: "none" }}>
                    {room.title?.[0] || "#"}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{room.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{room.destination_city}</div>
                  </div>
                </div>
                <div style={{ color: "var(--text3)" }}>
                  <Icon d={Icons.arrowRight} size={18} />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}