"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"

const Icon = ({ d, size = 22 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [tripName, setTripName] = useState("Squad Chat")
  const [loading, setLoading] = useState(true)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const spaceId = params.spaceId as string
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    let channel: any;

    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push("/")
      setCurrentUser(user)

      // Get Trip Name
      const { data: spaceData } = await supabase.from('spaces').select('title').eq('id', spaceId).single()
      if (spaceData) setTripName(spaceData.title)

      // Get Messages
      const { data: msgData } = await supabase
        .from('messages')
        .select(`*, author:profiles(full_name, avatar_url)`)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true })

      setMessages(msgData || [])
      setLoading(false)
      scrollToBottom()

      // Realtime Subscription
      channel = supabase
        .channel('realtime_messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `space_id=eq.${spaceId}` 
        }, async (payload) => {
          // Fetch author info for the new incoming message
          const { data: authorData } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', payload.new.user_id).single()
          const newMsg = { ...payload.new, author: authorData }
          
          setMessages((prev) => [...prev, newMsg])
          scrollToBottom()
        })
        .subscribe()
    }

    initChat()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [spaceId])

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 150)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return
    const textToSend = newMessage
    setNewMessage("") // Clear input instantly for snappy UX

    const { error } = await supabase
      .from('messages')
      .insert({
        content: textToSend,
        space_id: spaceId,
        user_id: currentUser.id
      })

    if (error) {
      console.error(error)
      alert("Failed to send message.")
    }
  }

  return (
    <div className="chat-container">
      {/* Navbar Overlay */}
      <div className="navbar" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d={Icons.arrowLeft} size={20} />
        </button>
        <div style={{ textAlign: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{tripName}</div>
          <div style={{ fontSize: 11, color: "var(--pink)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pink)", display: "inline-block", animation: "pulse-glow 2s infinite" }}></span>
            Live
          </div>
        </div>
        <div style={{ width: 24 }}></div> {/* Spacer to center title */}
      </div>

      {/* Messages Area */}
      {/* Messages Area */}
      {/* ✨ ADDED: style={{ paddingBottom: "120px" }} to ensure the last message clears the input bar */}
      <div className="chat-messages" style={{ paddingBottom: "120px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text3)", marginTop: 40, fontSize: 13 }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text3)", marginTop: 40, fontSize: 13 }}>
            No messages yet. Say hi! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUser?.id
            return (
              <div key={msg.id} className={`msg-row ${isMe ? 'me' : ''}`}>
                
                {/* Avatar for other people */}
                {!isMe && (
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                    {msg.author?.full_name?.[0] || "U"}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                  <div className="msg-name">
                    {isMe ? "You" : (msg.author?.full_name || "Traveler")}
                  </div>
                  <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                    {msg.content}
                  </div>
                </div>

              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sticky Input Bar */}
      <div className="chat-input-bar">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="say something cute 💜"
          className="chat-input"
        />
        <button onClick={handleSend} className="send-btn">
          <Icon d={Icons.send} size={16} />
        </button>
      </div>
    </div>
  )
}