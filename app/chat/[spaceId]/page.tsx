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
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [tripName, setTripName] = useState("Squad Chat")
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [showMembers, setShowMembers] = useState(false)
  
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

      const { data: spaceData } = await supabase.from('spaces').select('title').eq('id', spaceId).single()
      if (spaceData) setTripName(spaceData.title)

      fetchMessages()
      fetchMembers()

      channel = supabase.channel(`room-${spaceId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `space_id=eq.${spaceId}` }, 
        async (payload) => {
          const { data: author } = await supabase.from('profiles').select('full_name').eq('id', payload.new.user_id).single()
          setMessages(prev => [...prev, { ...payload.new, author }])
          scrollToBottom()
        }).subscribe()
    }
    initChat()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [spaceId])

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select(`*, author:profiles(full_name)`).eq('space_id', spaceId).order('created_at', { ascending: true })
    if (data) setMessages(data)
    setLoading(false)
    scrollToBottom()
  }

  const fetchMembers = async () => {
    const { data } = await supabase.from('space_members').select(`user:profiles(full_name, college_name)`).eq('space_id', spaceId).eq('status', 'approved')
    if (data) setMembers(data.map(m => m.user))
  }

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

  const handleSend = async () => {
    if (!newMessage.trim()) return
    const text = newMessage
    setNewMessage("")
    await supabase.from('messages').insert({ content: text, space_id: spaceId, user_id: currentUser.id })
  }

  return (
    <div className="chat-container">
      <div className="navbar" style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "space-between", padding: "0 16px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "white" }}><Icon d={Icons.arrowLeft} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{tripName}</div>
          <div style={{ fontSize: 11, color: "var(--pink)" }}>Live Chat 🔴</div>
        </div>
        <button onClick={() => setShowMembers(true)} style={{ background: "none", border: "none", color: "white" }}><Icon d={Icons.users} /></button>
      </div>

      <div className="chat-messages" style={{ paddingBottom: "120px", overflowY: "auto", flex: 1 }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-row ${msg.user_id === currentUser?.id ? 'me' : ''}`}>
            <div className="msg-bubble">{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Say something..." className="chat-input" />
        <button onClick={handleSend} className="send-btn"><Icon d={Icons.send} size={16} /></button>
      </div>

      {showMembers && (
        <div className="modal-overlay" onClick={() => setShowMembers(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ width: '300px', padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>The Squad 🎒</h3>
            {members.map((m, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600 }}>{m.full_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{m.college_name}</div>
              </div>
            ))}
            <button onClick={() => setShowMembers(false)} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}