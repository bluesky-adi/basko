"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation" // <-- ADDED FOR ROUTING

const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [hostedTrips, setHostedTrips] = useState<any[]>([])
  const [joinedTrips, setJoinedTrips] = useState<any[]>([])
  
  const supabase = createClient()
  const router = useRouter() // <-- INITIALIZED ROUTER

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Fetch User Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileData) setProfile(profileData)

    // 2. Fetch Trips Hosted by User (AND their join requests)
    const { data: hosted } = await supabase
      .from('spaces')
      .select(`*, requests:space_members(id, status, user:profiles(full_name))`)
      .eq('host_id', user.id)
      .eq('status', 'active')
    if (hosted) setHostedTrips(hosted)

    // 3. Fetch Trips the User Joined/Requested
    const { data: joined } = await supabase
      .from('space_members')
      .select(`status, space:spaces(*)`)
      .eq('user_id', user.id)
      .neq('space.host_id', user.id) // Don't show hosted trips here
    
    // @ts-ignore
    if (joined) setJoinedTrips(joined.filter(item => item.space !== null))
  }

  const handleRequest = async (memberId: string, action: 'approved' | 'rejected') => {
    await supabase.from('space_members').update({ status: action }).eq('id', memberId)
    fetchDashboardData() 
  }

  return (
    <div className="page">
      <div className="navbar">
        <span className="logo">basko</span>
        <div className="avatar avatar-sm">{profile?.full_name?.[0] || "B"}</div>
      </div>

      {/* PROFILE HEADER */}
      <div className="profile-header fade-up">
        <div className="avatar avatar-lg" style={{ boxShadow: "0 0 30px var(--glow)" }}>
          {profile?.full_name?.[0] || "B"}
        </div>
        <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
          {profile?.full_name || "Traveler"}
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
          {profile?.college_name || "College not set"}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        
        {/* SECTION 1: TRIPS YOU ARE HOSTING */}
        <div className="dash-section fade-up-1">
          <div className="dash-section-title">your trips 🗺</div>
          {hostedTrips.length === 0 && <p className="text-[12px] text-[var(--text3)] italic">You aren't hosting any trips yet.</p>}
          
          {hostedTrips.map((trip) => (
            // MODIFIED: Changed layout to stack vertically so button fits cleanly
            <div key={trip.id} className="glass dash-trip-row" style={{ borderRadius: "var(--radius-sm)", flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="dash-trip-info">
                  <div className="dash-trip-name">{trip.title}</div>
                  <div className="dash-trip-date">{trip.start_date} · ₹{trip.budget}</div>
                </div>
                <span className="badge badge-approved">Active</span>
              </div>
              
              {/* ✨ ADDED: HOST CHAT BUTTON */}
              <button className="btn-sm" onClick={() => router.push(`/chat/${trip.id}`)}>
                Open Group Chat 💬
              </button>
            </div>
          ))}
        </div>

        {/* SECTION 2: PENDING JOIN REQUESTS */}
        <div className="dash-section fade-up-2">
          <div className="dash-section-title">join requests 🎀</div>
          
          {hostedTrips.flatMap(t => t.requests).filter(r => r.status === 'pending').length === 0 && (
            <p className="text-[12px] text-[var(--text3)] italic">No pending requests right now.</p>
          )}

          {hostedTrips.map(trip => 
            trip.requests.filter((req: any) => req.status === 'pending').map((req: any) => (
              <div key={req.id} className="glass request-row" style={{ borderRadius: "var(--radius-sm)" }}>
                <div className="avatar avatar-sm">{req.user?.full_name?.[0] || "U"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{req.user?.full_name || "Someone"}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>wants to join: {trip.title}</div>
                </div>
                <div className="request-actions">
                  <button className="btn-accept" onClick={() => handleRequest(req.id, 'approved')}>
                    <Icon d={Icons.check} size={13} />
                  </button>
                  <button className="btn-reject" onClick={() => handleRequest(req.id, 'rejected')}>
                    <Icon d={Icons.x} size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SECTION 3: TRIPS YOU JOINED/REQUESTED */}
        <div className="dash-section fade-up-3">
          <div className="dash-section-title">trips you joined 💫</div>
          {joinedTrips.length === 0 && <p className="text-[12px] text-[var(--text3)] italic">You haven't requested to join any trips.</p>}

          {joinedTrips.map((item, i) => (
            // MODIFIED: Stack vertically to fit the button
            <div key={i} className="glass dash-trip-row" style={{ borderRadius: "var(--radius-sm)", flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="dash-trip-info">
                  <div className="dash-trip-name">{item.space?.title}</div>
                  <div className="dash-trip-date">{item.space?.start_date}</div>
                </div>
                <span className={`badge ${
                  item.status === 'approved' ? 'badge-approved' : 
                  item.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                }`}>
                  {item.status === 'approved' ? 'Approved ✓' : 
                   item.status === 'rejected' ? 'Rejected' : 'Pending...'}
                </span>
              </div>
              
              {/* ✨ ADDED: CONDITIONAL CHAT BUTTON (Only shows if approved) */}
              {item.status === 'approved' && (
                <button 
                  className="btn-sm" 
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", boxShadow: "none", color: "var(--text)" }} 
                  onClick={() => router.push(`/chat/${item.space?.id}`)}
                >
                  Enter Chat 💬
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}