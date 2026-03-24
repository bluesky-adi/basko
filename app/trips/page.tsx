"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17zM19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
}

export default function TripsPage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const filters = ["All", "Girls Only 🎀", "Budget", "Adventure", "Beach"]
  
  const [trips, setTrips] = useState<any[]>([])
  const [myRequests, setMyRequests] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      // 1. Fetch all active trips from Supabase
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (spacesData) setTrips(spacesData)

      // 2. Fetch trips the user has already requested to join
      const { data: requestsData } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id)
      
      if (requestsData) {
        setMyRequests(requestsData.map(r => r.space_id))
      }
    }
    fetchData()
  }, [])

  const handleJoinTrip = async (spaceId: string) => {
    if (!currentUserId || myRequests.includes(spaceId)) return

    // Optimistic UI update
    setMyRequests([...myRequests, spaceId])

    // Real database insert
    await supabase.from('space_members').insert({
      space_id: spaceId,
      user_id: currentUserId,
      status: 'pending'
    })
  }

  // Basic filtering logic
  const filteredTrips = activeFilter === "All" 
    ? trips 
    : trips.filter(t => activeFilter === "Girls Only 🎀" ? t.girls_only === true : true)

  return (
    <div className="page">
      <div className="navbar">
        <span className="logo">basko</span>
        <button style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}>
          <Icon d={Icons.sparkles} size={20} />
        </button>
      </div>

      <div className="s-header fade-up">
        <div className="section-heading">Find your squad 🌍</div>
        <div className="section-sub">trips waiting for you to say yes</div>
      </div>

      <div className="filter-bar fade-up-1">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
        {filteredTrips.map((trip, i) => {
          const hasJoined = myRequests.includes(trip.id)
          
          return (
            <div key={trip.id} className="glass trip-card" style={{ animationDelay: `${i * 0.08}s`, animation: "fadeUp 0.4s ease both" }}>
              {/* Fallback image if none exists in DB */}
              <img src={"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"} alt="" className="trip-img" />
              
              <div className="trip-body">
                <div className="trip-title">{trip.title}</div>
                <div className="trip-dest">
                  <Icon d={Icons.mapPin} size={11} /> {trip.destination_city}
                </div>
                
                <div className="trip-tags">
                  {trip.girls_only && <span className="tag tag-girls" style={{ fontSize: 10, padding: "3px 8px" }}>Girls Only 🎀</span>}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>
                  <Icon d={Icons.calendar} size={11} />
                  {trip.start_date}
                  <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--lavender)" }}>₹{trip.budget}</span>
                </div>
                
                <div style={{ marginTop: "auto", paddingTop: 10 }}>
                  <button
                    className="btn-sm"
                    style={{ 
                      width: "100%", fontSize: 11, padding: "8px", 
                      background: hasJoined ? "rgba(100,220,150,0.15)" : undefined, 
                      color: hasJoined ? "#7ee8a2" : undefined, 
                      border: hasJoined ? "1px solid rgba(100,220,150,0.3)" : "none" 
                    }}
                    onClick={() => handleJoinTrip(trip.id)}
                    disabled={hasJoined}
                  >
                    {hasJoined ? "✓ Requested!" : "Join trip ✨"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}