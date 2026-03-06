"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Auto-scroll to bottom
  const bottomRef = useRef<HTMLDivElement>(null)
  
  const params = useParams()
  const spaceId = params.spaceId as string
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // 1. Get User & Initial Messages
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push("/")
      setCurrentUser(user)

      const { data } = await supabase
        .from('messages')
        .select(`*, author:profiles(full_name)`) // Join with profile to get names
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true })

      setMessages(data || [])
      setLoading(false)
      scrollToBottom()
    }
    init()

    // 2. SUBSCRIBE to Realtime Changes (The Magic) ⚡
    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `space_id=eq.${spaceId}` 
      }, (payload) => {
        // When a new message comes in, fetch its author name
        fetchAuthorAndAdd(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceId])

  const fetchAuthorAndAdd = async (msg: any) => {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', msg.user_id).single()
    const newMsg = { ...msg, author: data }
    setMessages((prev) => [...prev, newMsg])
    scrollToBottom()
  }

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage,
        space_id: spaceId,
        user_id: currentUser.id
      })

    if (error) console.error(error)
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 mr-4">
            <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
            <h1 className="font-bold text-lg">Squad Chat 💬</h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
            </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 text-sm">No messages yet. Say hi! 👋</p>
        ) : (
            messages.map((msg) => {
                const isMe = msg.user_id === currentUser?.id
                // ... inside messages.map((msg) => { ...
return (
    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* NEW: Name Tag (Always visible now) */}
        <span className="text-[10px] text-gray-400 mb-1 px-1">
            {isMe ? "You" : (msg.author?.full_name || "Unknown")}
        </span>

        {/* The Bubble */}
        <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
            isMe ? 'bg-basko-brand text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
        }`}>
            <p className="text-sm">{msg.content}</p>
        </div>
    </div>
)
// ...
            })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="rounded-full bg-gray-50 border-none h-12"
        />
        <Button onClick={handleSend} size="icon" className="rounded-full h-12 w-12 bg-basko-brand hover:bg-basko-glow">
            <Send className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  )
}