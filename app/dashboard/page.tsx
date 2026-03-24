"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Settings, LogOut, Trash2, Share2, MessageSquare, Check, X, User } from "lucide-react"

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [hostedTrips, setHostedTrips] = useState<any[]>([])
  const [joinedTrips, setJoinedTrips] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  
  // Edit States
  const [editName, setEditName] = useState("")
  const [editCollege, setEditCollege] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editGender, setEditGender] = useState("")

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profileData) {
      setProfile(profileData)
      setEditName(profileData.full_name || "")
      setEditCollege(profileData.college_name || "")
      setEditBio(profileData.bio || "")
      setEditGender(profileData.gender || "")
    }

    const { data: hosted } = await supabase
      .from('spaces')
      .select(`*, requests:space_members(id, status, user:profiles(full_name))`)
      .eq('host_id', user.id)
      .eq('status', 'active')
    if (hosted) setHostedTrips(hosted)

    const { data: joined } = await supabase
      .from('space_members')
      .select(`status, space:spaces(*)`)
      .eq('user_id', user.id)
      .neq('space.host_id', user.id) 
    
    // @ts-ignore
    if (joined) setJoinedTrips(joined.filter(item => item.space !== null))
  }

  // ✨ THE BULLETPROOF UPDATE FUNCTION
  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 🛡️ Security Check: Gender limit
      if (editGender !== profile?.gender) {
        const lastUpdate = profile?.gender_updated_at ? new Date(profile.gender_updated_at) : new Date(0)
        const daysSince = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)
        if (daysSince < 15) {
          alert("Safety Lock: Gender can only be changed twice a month. 🛡️")
          return
        }
      }

      // 💾 The Update
      const { error } = await supabase.from('profiles').update({
        full_name: editName,
        college_name: editCollege,
        bio: editBio,
        gender: editGender, 
        gender_updated_at: editGender !== profile?.gender ? new Date().toISOString() : profile?.gender_updated_at
      }).eq('id', user.id)

      if (error) throw error

      // ✅ SUCCESS: Close and Refresh
      setIsEditing(false)
      await fetchDashboardData()
      alert("Profile Updated! ✨")

    } catch (err: any) {
      console.error(err)
      alert("Save Failed: " + err.message)
    }
  }

  const handleRequest = async (memberId: string, action: 'approved' | 'rejected') => {
    await supabase.from('space_members').update({ status: action }).eq('id', memberId)
    fetchDashboardData() 
  }

  const handleShareTrip = (tripId: string) => {
    const url = `${window.location.origin}/trips/${tripId}`
    navigator.clipboard.writeText(url)
    alert("Trip link copied! 🚀")
  }

  return (
    <div className="page">
      <div className="navbar" style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px" }}>
        <span className="logo">basko</span>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <Settings size={20} onClick={() => setIsEditing(true)} style={{ cursor: "pointer", color: "var(--text2)" }} />
          <LogOut size={20} onClick={() => supabase.auth.signOut().then(() => router.push('/'))} style={{ cursor: "pointer", color: "#ff8080" }} />
        </div>
      </div>

      <div className="profile-header fade-up">
        <div className="avatar avatar-lg" style={{ boxShadow: "0 0 30px var(--glow)", margin: '0 auto' }}>{profile?.full_name?.[0] || "B"}</div>
        <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700 }}>{profile?.full_name || "Traveler"}</div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
          {profile?.college_name || "College not set"} • <span style={{ textTransform: 'capitalize' }}>{profile?.gender || "Gender unset"}</span>
        </div>
        <p className="bio-text" style={{ marginTop: '12px', fontStyle: 'italic', fontSize: '13px', color: 'var(--text2)', maxWidth: '280px', margin: '12px auto' }}>
          {profile?.bio || "No bio yet. Tap settings! ✍️"}
        </p>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* HOSTED TRIPS */}
        <div className="dash-section">
          <div className="dash-section-title">your trips 🗺</div>
          {hostedTrips.map((trip) => (
            <div key={trip.id} className="glass" style={{ padding: '16px', marginBottom: '12px', borderRadius: '16px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: '12px' }}>
                <div style={{ fontWeight: 600 }}>{trip.title}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Share2 size={18} onClick={() => handleShareTrip(trip.id)} style={{ color: 'var(--lavender)', cursor: 'pointer' }} />
                  <Trash2 size={18} onClick={() => { if(window.confirm("Delete?")) supabase.from('spaces').delete().eq('id', trip.id).then(fetchDashboardData) }} style={{ color: '#ff8080', cursor: 'pointer' }} />
                </div>
              </div>
              <button className="btn-sm" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => router.push(`/chat/${trip.id}`)}>
                <MessageSquare size={14} style={{ marginRight: '8px' }} /> Open Group Chat
              </button>
            </div>
          ))}
        </div>

        {/* JOIN REQUESTS */}
        <div className="dash-section">
          <div className="dash-section-title">join requests 🎀</div>
          {hostedTrips.flatMap(t => t.requests).filter(r => r.status === 'pending').map(req => (
            <div key={req.id} className="glass request-row" style={{ padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px' }}><b>{req.user?.full_name}</b> wants to join</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleRequest(req.id, 'approved')} style={{ background: '#4ade8020', color: '#4ade80', border: 'none', padding: '5px', borderRadius: '5px' }}><Check size={16}/></button>
                <button onClick={() => handleRequest(req.id, 'rejected')} style={{ background: '#f8717120', color: '#f87171', border: 'none', padding: '5px', borderRadius: '5px' }}><X size={16}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* JOINED TRIPS */}
        <div className="dash-section">
          <div className="dash-section-title">trips you joined 💫</div>
          {joinedTrips.map((item, i) => (
            <div key={i} className="glass" style={{ padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.space?.title}</div>
                <span className={`badge badge-${item.status}`}>{item.status}</span>
              </div>
              {item.status === 'approved' && (
                <button className="btn-sm" style={{ width: '100%' }} onClick={() => router.push(`/chat/${item.space?.id}`)}>Enter Chat 💬</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content glass" style={{ width: '100%', maxWidth: '400px', maxHeight: '85vh', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>Edit Profile ✨</h2>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '8px' }}>NAME</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'white', marginBottom: '15px' }} />
              
              <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '8px' }}>COLLEGE</label>
              <input value={editCollege} onChange={e => setEditCollege(e.target.value)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'white', marginBottom: '15px' }} />

              <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '8px' }}>BIO</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'white', height: '80px', marginBottom: '15px', resize: 'none' }} />

              <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '8px' }}>GENDER</label>
              <select value={editGender} onChange={e => setEditGender(e.target.value)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'white', marginBottom: '5px' }}>
                <option value="male">Male 🚀</option>
                <option value="female">Female 🌸</option>
                <option value="other">Other 🌈</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'none', border: '1px solid var(--border)', color: 'white', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleUpdateProfile} className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px' }}>Save & Return ✨</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}