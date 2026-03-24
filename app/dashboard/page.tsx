"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  settings: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [hostedTrips, setHostedTrips] = useState<any[]>([])
  const [joinedTrips, setJoinedTrips] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  
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

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      full_name: editName,
      college_name: editCollege,
      bio: editBio,
      gender: editGender
    }).eq('id', user?.id)

    setIsEditing(false)
    fetchDashboardData()
  }

  const handleRequest = async (memberId: string, action: 'approved' | 'rejected') => {
    await supabase.from('space_members').update({ status: action }).eq('id', memberId)
    fetchDashboardData() 
  }

  const handleLogOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="page">
      <div className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="logo">basko</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}>
            <Icon d={Icons.settings} size={20} />
          </button>
          <button onClick={handleLogOut} style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", color: "#ff8080", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
            Log Out
          </button>
        </div>
      </div>

      <div className="profile-header fade-up">
        <div className="avatar avatar-lg" style={{ boxShadow: "0 0 30px var(--glow)" }}>{profile?.full_name?.[0] || "B"}</div>
        <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700 }}>{profile?.full_name || "Traveler"}</div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
          {profile?.college_name || "College not set"} • <span style={{ textTransform: 'capitalize' }}>{profile?.gender || "Gender unset"}</span>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div className="dash-section fade-up-1">
          <div className="dash-section-title">your trips 🗺</div>
          {hostedTrips.map((trip) => (
            <div key={trip.id} className="glass dash-trip-row" style={{ borderRadius: "12px", flexDirection: "column", alignItems: "stretch", gap: "12px", padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                   <div style={{ fontWeight: 600 }}>{trip.title}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{trip.start_date} · ₹{trip.budget}</div>
                </div>
                <span className="badge badge-approved">Active</span>
              </div>
              <button className="btn-sm" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white' }} onClick={() => router.push(`/chat/${trip.id}`)}>
                Open Group Chat 💬
              </button>
            </div>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Edit Profile ✨</h2>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text3)' }}>Full Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
            </div>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text3)' }}>Gender</label>
              <select value={editGender} onChange={e => setEditGender(e.target.value)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }}>
                <option value="">Select gender</option>
                <option value="female">Female 🌸</option>
                <option value="male">Male 🚀</option>
              </select>
            </div>
            <button onClick={handleUpdateProfile} className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  )
}