"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

const Icon = ({ d, size = 22 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
}

export default function PublicProfile() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfileData() {
      // 1. Fetch the User's Profile Info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (profile) setUserProfile(profile)

      // 2. Fetch all posts by this user
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', id)
        .order('created_at', { ascending: false })
      
      if (posts) setUserPosts(posts)
      setLoading(false)
    }
    fetchProfileData()
  }, [id])

  if (loading) return <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>Loading Profile...</div>

  return (
    <div className="page">
      <div className="navbar" style={{ position: "absolute", top: 0, background: "transparent", border: "none" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(0,0,0,0.3)", border: "none", color: "white", padding: "8px", borderRadius: "50%", cursor: "pointer" }}>
          <Icon d={Icons.arrowLeft} size={20} />
        </button>
      </div>

      <div className="profile-cover"></div>

      <div className="profile-info-card fade-up">
        <div className="avatar avatar-xl">
          {userProfile?.full_name?.[0] || "U"}
        </div>
        
        <h1 style={{ marginTop: 16, fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
          {userProfile?.full_name || "Traveler"}
        </h1>
        
        <div style={{ color: "var(--lavender)", fontSize: 13, fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <Icon d={Icons.mapPin} size={14} /> {userProfile?.college_name || "Basko Student"}
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-val">{userPosts.length}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">0</span>
            <span className="stat-label">Trips</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">LVL 1</span>
            <span className="stat-label">Rank</span>
          </div>
        </div>

        <p className="bio-text">
          {userProfile?.bio || "Just a student looking for the next adventure. Let's explore the world together! 🌍✨"}
        </p>

        <button className="btn-primary" style={{ maxWidth: "200px", margin: "0 auto 32px", fontSize: "13px" }}>
          Follow Traveler
        </button>
      </div>

      <div className="dash-section-title" style={{ paddingLeft: "16px" }}>Memories 📸</div>
      
      <div className="profile-grid">
        {userPosts.filter(p => p.image_url).map((post) => (
          <img 
            key={post.id} 
            src={post.image_url} 
            className="grid-img" 
            alt="trip" 
            onClick={() => router.push('/explore')} 
          />
        ))}
      </div>

      {userPosts.filter(p => p.image_url).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text3)", fontSize: "13px" }}>
          No travel photos shared yet.
        </div>
      )}
    </div>
  )
}