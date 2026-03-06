"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, MapPin, Calendar, Trash2, Edit, User, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MySpaces() {
  const [hosting, setHosting] = useState<any[]>([])
  const [joined, setJoined] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { fetchMyTrips() }, [])

  const fetchMyTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Fetch Hosted Trips (With Requests)
    const { data: myHosted } = await supabase
      .from('spaces')
      .select(`*, requests:space_members(id, status, user:profiles(full_name, college_name))`)
      .eq('host_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // 2. Fetch Joined Trips
    const { data: myJoined } = await supabase
      .from('space_members')
      .select(`status, space:spaces(*)`)
      .eq('user_id', user.id)
      .neq('space.host_id', user.id)

    if (myHosted) setHosting(myHosted)
    if (myJoined) setJoined(myJoined.filter(item => item.space !== null))
    setLoading(false)
  }

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    setLoading(true)
    await supabase.from('spaces').delete().eq('id', spaceId)
    fetchMyTrips()
    setLoading(false)
  }

  const handleRequest = async (memberId: string, action: 'approved' | 'rejected') => {
    setLoading(true)
    await supabase.from('space_members').update({ status: action }).eq('id', memberId)
    fetchMyTrips() 
    setLoading(false)
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-[var(--background)]"><Loader2 className="animate-spin text-violet-600 w-8 h-8" /></div>

  return (
    <div className="p-6 md:p-12 space-y-8 min-h-screen transition-colors duration-300 pb-24">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-8">My Trips ✈️</h1>

        {/* SECTION 1: HOSTING */}
        <div className="mb-12">
            <h2 className="text-sm font-bold text-[var(--muted-foreground)] uppercase mb-4 tracking-wider">
                Hosting ({hosting.length})
            </h2>
            <div className="space-y-6">
                {hosting.map((space) => {
                    const pending = space.requests.filter((r: any) => r.status === 'pending')
                    
                    return (
                        // ✨ THE NEW CINEMATIC DASHBOARD CARD
                        <div key={space.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden transition-all">
                            
                            {/* Header */}
                            <div className="p-5 border-b border-[var(--border)] flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--foreground)]">{space.title}</h3>
                                    <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2 mt-2 font-medium">
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-violet-500" /> {space.destination_city}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-violet-500" /> {space.start_date}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2 bg-[var(--muted)] p-1 rounded-lg">
                                    <button className="p-2 text-[var(--muted-foreground)] hover:text-violet-500 hover:bg-[var(--card)] rounded-md transition-all" onClick={() => router.push(`/edit-space/${space.id}`)}>
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-[var(--card)] rounded-md transition-all" onClick={() => handleDeleteSpace(space.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Body (Requests & Actions) */}
                            <div className="p-5 bg-[var(--background)]/50">
                                {/* PENDING REQUESTS */}
                                {pending.length > 0 ? (
                                    <div className="space-y-3 mb-6">
                                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Pending Requests ({pending.length})</p>
                                        {pending.map((req: any) => (
                                            <div key={req.id} className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-violet-500/10 rounded-full flex items-center justify-center text-violet-500">
                                                        <User className="w-4 h-4"/>
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-bold text-[var(--foreground)] leading-none">{req.user?.full_name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors" onClick={() => handleRequest(req.id, 'approved')}><Check className="w-4 h-4"/></button>
                                                    <button className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors" onClick={() => handleRequest(req.id, 'rejected')}><X className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--muted-foreground)] italic mb-6 bg-[var(--muted)] p-3 rounded-lg border border-[var(--border)]">No new requests to join your squad.</p>
                                )}
                                
                                <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-2" onClick={() => router.push(`/chat/${space.id}`)}>
                                    Open Group Chat <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
                {hosting.length === 0 && (
                    <div className="text-center py-10 bg-[var(--card)] border border-[var(--border)] rounded-2xl border-dashed">
                        <p className="text-[var(--muted-foreground)]">You aren't hosting any trips yet.</p>
                    </div>
                )}
            </div>
        </div>

        {/* SECTION 2: JOINED */}
        <div>
            <h2 className="text-sm font-bold text-[var(--muted-foreground)] uppercase mb-4 tracking-wider">
                Joined ({joined.length})
            </h2>
            <div className="space-y-4">
                {joined.map((item) => (
                    <div key={item.space?.id} className="bg-[var(--card)] p-5 rounded-2xl shadow-sm flex items-center justify-between border border-[var(--border)] hover:border-violet-500/30 transition-colors">
                        <div>
                            <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight mb-1">{item.space?.title}</h3>
                            <p className="text-sm text-[var(--muted-foreground)] font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-violet-500" /> {item.space?.destination_city}
                            </p>
                        </div>
                        <div>
                            {item.status === 'approved' && (
                                <button className="bg-[var(--foreground)] text-[var(--background)] hover:bg-violet-600 hover:text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors" onClick={() => router.push(`/chat/${item.space.id}`)}>
                                    Go to Chat
                                </button>
                            )}
                            {item.status === 'pending' && <span className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">Pending</span>}
                            {item.status === 'rejected' && <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">Rejected</span>}
                        </div>
                    </div>
                ))}
                {joined.length === 0 && (
                    <div className="text-center py-10 bg-[var(--card)] border border-[var(--border)] rounded-2xl border-dashed">
                        <p className="text-[var(--muted-foreground)]">You haven't joined any trips yet.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}