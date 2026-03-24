"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const Icon = ({ d, size = 22 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
}

export default function CreatePage() {
  const [tab, setTab] = useState("post")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  // Post State
  const [postContent, setPostContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploadText, setUploadText] = useState("Upload a photo from your device 📸")

  // Trip State
  const [title, setTitle] = useState("")
  const [dest, setDest] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("") // ✨ Added End Date
  const [budget, setBudget] = useState("")
  const [spots, setSpots] = useState("5")
  const [girlsOnly, setGirlsOnly] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getUser()
  }, [])

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setUploadText("Uploading... ⏳")
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('uploads').upload(fileName, file)
    if (error) {
      alert("Upload failed!")
      setLoading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName)
    setImageUrl(publicUrl)
    setUploadText("Image Uploaded! ✨")
    setLoading(false)
  }

  const handleCreatePost = async () => {
    if (!postContent) return alert("Write something first! ✨")
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('posts').insert({ author_id: user?.id, content: postContent, image_url: imageUrl || null })
    setLoading(false)
    router.push('/explore') 
  }

  const handleCreateTrip = async () => {
    // ✨ Validation including End Date
    if (!title || !dest || !budget || !spots || !startDate || !endDate) {
      return alert("Please fill in all trip details, including dates! 🌍")
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('spaces').insert({
      host_id: user?.id,
      title: title,
      destination_city: dest,
      start_date: startDate,
      end_date: endDate, // ✨ New field
      budget: parseInt(budget),
      slots_total: parseInt(spots),
      girls_only: girlsOnly,
      status: 'active'
    })

    if (error) {
        alert("Error saving: " + error.message)
        setLoading(false)
    } else {
      setLoading(false)
      router.push('/dashboard')
    }
  }

  return (
    <div className="page" style={{ height: "100vh", overflowY: "auto", paddingBottom: "120px" }}>
      <div className="navbar" style={{ justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Create something ✨</span>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <div className="tabs fade-up">
          <button className={`tab ${tab === "post" ? "active" : ""}`} onClick={() => setTab("post")}>Share a moment</button>
          <button className={`tab ${tab === "trip" ? "active" : ""}`} onClick={() => setTab("trip")}>Plan an escape</button>
        </div>

        {tab === "post" ? (
          <div className="fade-up-1">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="avatar">{profile?.full_name?.[0] || "🌸"}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{profile?.full_name || "You"}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>sharing with the world 🌍</div>
              </div>
            </div>
            <div className="input-wrap" style={{ marginBottom: 16 }}>
              <textarea placeholder="what happened? 🌸" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} id="file-upload" style={{ display: "none" }} />
            <label htmlFor="file-upload" className="upload-area" style={{ width: "100%", padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: "1px dashed var(--border)", borderRadius: "12px", background: "var(--surface2)", cursor: "pointer", marginBottom: 10 }}>
              <Icon d={Icons.camera} size={20} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{uploadText}</span>
            </label>
            <button onClick={handleCreatePost} disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px", borderRadius: "99px", background: "linear-gradient(135deg, var(--violet), #c46fff)", color: "#fff", border: "none", fontWeight: "bold" }}>
              {loading ? "Sharing..." : "Share it 🌸"}
            </button>
          </div>
        ) : (
          <div className="fade-up-1">
            <label>Trip title</label>
            <div className="input-wrap"><div className="input-icon"><Icon d={Icons.sparkles} size={16} /></div>
              <input type="text" placeholder="give it a name that slaps ✨" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <label>Destination</label>
            <div className="input-wrap"><div className="input-icon"><Icon d={Icons.mapPin} size={16} /></div>
              <input type="text" placeholder="where are we going?" value={dest} onChange={e => setDest(e.target.value)} />
            </div>

            {/* ✨ SIDE BY SIDE DATES */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Start Date</label>
                <div className="input-wrap">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ paddingLeft: 12, paddingRight: 10 }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label>End Date</label>
                <div className="input-wrap">
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ paddingLeft: 12, paddingRight: 10 }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Budget</label>
                <div className="input-wrap"><div className="input-icon"><b>₹</b></div>
                  <input type="number" placeholder="5000" value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label>Spots</label>
                <div className="input-wrap"><div className="input-icon"><Icon d={Icons.user} size={16} /></div>
                  <input type="number" value={spots} onChange={e => setSpots(e.target.value)} />
                </div>
              </div>
            </div>

            {/* ✨ GIRLS ONLY TOGGLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(240,167,216,0.1)', border: '1px solid rgba(240,167,216,0.2)', borderRadius: '12px', marginBottom: '24px' }}>
              <div>
                <div style={{ color: 'var(--pink)', fontWeight: '700', fontSize: '14px' }}>Girls Only Trip 🎀</div>
                <div style={{ color: 'var(--text3)', fontSize: '11px' }}>Only female profiles can join.</div>
              </div>
              <button type="button" onClick={() => setGirlsOnly(!girlsOnly)} style={{ width: '44px', height: '24px', borderRadius: '20px', background: girlsOnly ? 'var(--pink)' : '#333', position: 'relative', border: 'none', cursor: 'pointer', transition: '0.3s' }}>
                <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: girlsOnly ? '23px' : '3px', transition: '0.3s' }} />
              </button>
            </div>

            <button onClick={handleCreateTrip} disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px", borderRadius: "99px", background: "linear-gradient(135deg, var(--violet), #c46fff)", color: "#fff", border: "none", fontWeight: "bold" }}>
              {loading ? "Planning..." : "Plan your escape ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}