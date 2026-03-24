"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17zM19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  arrowRight: "M5 12h14m-7-7l7 7-7 7"
}

export default function TripsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("All")
  const filters = ["All", "Girls Only 🎀", "Budget", "Adventure"]
  
  const [trips, setTrips] = useState<any[]>([])
  const [myRequests, setMyRequests] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    // Fetch trips + member counts
    const { data: spacesData } = await supabase
      .from('spaces')
      .select(`*, space_members(count)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (spacesData) setTrips(spacesData)

    const { data: requestsData } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', user.id)
    
    if (requestsData) {
      setMyRequests(requestsData.map(r => r.space_id))
    }
  }

  const handleToggleJoin = async (trip: any) => {
    if (!currentUserId) return router.push('/')
    
    const isAlreadyRequested = myRequests.includes(trip.id)

    if (isAlreadyRequested) {
      // UNSEND/UNDO Request
      const { error } = await supabase
        .from('space_members')
        .delete()
        .match({ space_id: trip.id, user_id: currentUserId })
      
      if (!error) {
        setMyRequests(myRequests.filter(id => id !== trip.id))
        alert("Request retracted! 💨")
      }
    } else {
      // 🛡️ SECURITY CHECKS
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', currentUserId).single()

      if (trip.girls_only && profile?.gender !== 'female') {
        return alert("Sorry! This is a Girls-Only trip 🌸. Only girls can join this squad.")
      }

      // SEND Request
      const { error } = await supabase.from('space_members').insert({
        space_id: trip.id,
        user_id: currentUserId,
        status: 'pending'
      })

      if (!error) {
        setMyRequests([...myRequests, trip.id])
        alert("Request sent! ✨")
      }
    }
  }

  const handleShareTrip = (tripId: string) => {
    const url = `${window.location.origin}/trips/${tripId}`
    navigator.clipboard.writeText(url)
    alert("Trip link copied! Send it to your squad 🚀")
  }

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.destination_city?.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (activeFilter === "All") return true
    if (activeFilter === "Girls Only 🎀") return t.girls_only === true
    if (activeFilter === "Budget") return t.budget < 5000
    return true
  })

  return (
    <div className="page">
      <div className="navbar">
        <span className="logo">basko</span>
        <button style={{ background: "none", border: "none", color: "var(--text2)" }}>
          <Icon d={Icons.sparkles} size={20} />
        </button>
      </div>

      <div className="s-header fade-up">
        <div className="section-heading">Find your squad 🌍</div>
        <div className="section-sub">trips waiting for you to say yes</div>
      </div>

      <div className="search-wrap fade-up-1" style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div className="glass" style={{ borderRadius: '14px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '14px', color: 'var(--text3)' }}>
            <Icon d={Icons.search} size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search destinations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', padding: '14px 14px 14px 42px', color: 'white', outline: 'none', width: '100%' }}
          />
        </div>
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
          const spotsTaken = trip.space_members?.[0]?.count || 0
          
          return (
            <div key={trip.id} className="glass trip-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ position: 'relative' }}>
                <img src={"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"} alt="" className="trip-img" />
                <button 
                  onClick={() => handleShareTrip(trip.id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                >
                  <Icon d={Icons.send} size={14} />
                </button>
              </div>
              
              <div className="trip-body">
                <div className="trip-title" style={{ fontSize: '15px' }}>{trip.title}</div>
                <div className="trip-dest" style={{ marginBottom: '8px' }}>
                  <Icon d={Icons.mapPin} size={11} /> {trip.destination_city}
                </div>
                
                <div className="trip-tags" style={{ marginBottom: '10px' }}>
                  {trip.girls_only && <span className="tag" style={{ fontSize: 8, background: 'rgba(240,167,216,0.1)', color: 'var(--pink)' }}>Girls Only 🎀</span>}
                  <span className="spots-badge" style={{ fontSize: 8, color: spotsTaken >= trip.slots_total ? 'var(--pink)' : 'var(--lavender)', fontWeight: 'bold' }}>
                    {spotsTaken}/{trip.slots_total} Joined
                  </span>
                </div>

                {/* ✨ DATES & BUDGET SECTION */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text3)', marginBottom: '5px' }}>
                    <Icon d={Icons.calendar} size={10} />
                    <span>{trip.start_date}</span>
                    <Icon d={Icons.arrowRight} size={8} />
                    <span>{trip.end_date || 'TBA'}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--lavender)", fontSize: '14px' }}>₹{trip.budget}</div>
                </div>
                
                <div style={{ marginTop: "auto" }}>
                  <button
                    className="btn-sm"
                    style={{ 
                      width: "100%", fontSize: 10, padding: "8px", 
                      background: hasJoined ? "rgba(100,220,150,0.15)" : (spotsTaken >= trip.slots_total ? "#333" : undefined), 
                      color: hasJoined ? "#7ee8a2" : (spotsTaken >= trip.slots_total ? "#777" : undefined), 
                      border: hasJoined ? "1px solid rgba(100,220,150,0.3)" : "none" 
                    }}
                    onClick={() => handleToggleJoin(trip)}
                    disabled={!hasJoined && spotsTaken >= trip.slots_total}
                  >
                    {hasJoined ? "✓ Sent (Tap to Undo)" : (spotsTaken >= trip.slots_total ? "Trip Full 🎒" : "Join ✨")}
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