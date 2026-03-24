"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const Icons = {
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  messageCircle: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  moreHorizontal: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
  trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  x: "M18 6L6 18M6 6l12 12"
}

export default function ExplorePage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  // Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
    
    const { data } = await supabase
      .from('posts')
      .select(`*, author:profiles(full_name, avatar_url), likes:post_likes(user_id), comments:comments(id)`)
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  // ✨ SECURE JOIN LOGIC (In case you have trip cards here)
  const handleJoinTrip = async (trip: any) => {
    if (!currentUserId) return router.push('/')

    // Fetch latest profile to check gender
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', currentUserId)
      .single()

    if (trip.girls_only && profile?.gender !== 'female') {
      return alert("Sorry! This is a Girls-Only trip 🌸. Please update your gender in Dashboard settings if this is an error.")
    }

    const { error } = await supabase.from('space_members').insert({
      space_id: trip.id,
      user_id: currentUserId,
      status: 'pending'
    })

    if (error) alert("Error sending request.")
    else alert("Request sent! Check Dashboard for updates ✨")
  }

  const handleOpenComments = async (postId: string) => {
    setActiveCommentPostId(postId)
    setPostComments([]) 
    
    const { data } = await supabase
      .from('comments')
      .select(`*, author:profiles(full_name, avatar_url)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (data) setPostComments(data)
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || !activeCommentPostId || !currentUserId) return
    const commentText = newComment
    setNewComment("")

    const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', currentUserId).single()
    
    const fakeComment = { id: Date.now(), content: commentText, author: { full_name: userData?.full_name || "You" } }
    setPostComments((prev) => [...prev, fakeComment])

    await supabase.from('comments').insert({
      post_id: activeCommentPostId,
      user_id: currentUserId,
      content: commentText
    })

    fetchFeed() 
  }

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/explore?post=${postId}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Basko Trip', text: 'Check out this post on Basko! ✨', url: shareUrl }) } 
      catch (err) { console.log("Share cancelled") }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard! 📋")
    }
  }

  const toggleLike = async (postId: string, currentLikes: any[]) => {
    if (!currentUserId) return
    const hasLiked = currentLikes.some((l: any) => l.user_id === currentUserId)
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: hasLiked ? p.likes.filter((l:any) => l.user_id !== currentUserId) : [...p.likes, { user_id: currentUserId }] } : p))
    if (hasLiked) { await supabase.from('post_likes').delete().match({ user_id: currentUserId, post_id: postId }) } 
    else { await supabase.from('post_likes').insert({ user_id: currentUserId, post_id: postId }) }
  }

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return
    setPosts(posts.filter(p => p.id !== postId))
    setOpenDropdownId(null)
    await supabase.from('posts').delete().eq('id', postId)
  }

  const handleReportPost = async (postId: string) => {
    alert("Post reported to moderators. Thank you for keeping Basko safe! 🛡️")
    setOpenDropdownId(null)
    if (currentUserId) {
      await supabase.from('reports').insert({ reporter_id: currentUserId, post_id: postId, reason: "Inappropriate content" })
    }
  }

  return (
    <div className="page" style={{ position: "relative" }}>
      <div className="navbar">
        <span className="logo">basko</span>
        <button style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}>
          <Icon d={Icons.filter} size={20} />
        </button>
      </div>

      <div className="s-header fade-up">
        <div className="section-heading">What's happening ✨</div>
        <div className="section-sub">see where everyone's running off to</div>
      </div>

      <div onClick={() => setOpenDropdownId(null)}>
        {posts.map((post, i) => {
          const isLiked = post.likes?.some((l: any) => l.user_id === currentUserId);
          const likeCount = post.likes?.length || 0;
          const commentCount = post.comments?.length || 0;
          const isMyPost = post.author_id === currentUserId;

          return (
            <div key={post.id} className="glass post-card" style={{ animationDelay: `${i * 0.08}s`, position: "relative" }}>
              <div className="post-header">
                <div 
                  style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                  onClick={() => router.push(`/profile/${post.author_id}`)}
                >
                  <div className="avatar">{post.author?.full_name?.[0] || "🌸"}</div>
                  <div className="post-meta">
                    <div className="post-name">{post.author?.full_name || "Traveler"}</div>
                    <div className="post-time">Recently</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === post.id ? null : post.id); }}
                  style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: "4px" }}
                >
                  <Icon d={Icons.moreHorizontal} size={20} />
                </button>
              </div>

              {openDropdownId === post.id && (
                <div className="dropdown-menu">
                  {isMyPost ? (
                    <button className="dropdown-item danger" onClick={() => handleDeletePost(post.id)}>
                      <Icon d={Icons.trash} size={16} /> Delete Post
                    </button>
                  ) : (
                    <button className="dropdown-item" onClick={() => handleReportPost(post.id)}>
                      <Icon d={Icons.flag} size={16} /> Report
                    </button>
                  )}
                </div>
              )}
              
              <div className="post-text">{post.content}</div>
              {post.image_url && <img src={post.image_url} alt="" className="post-img" />}
              
              <div className="post-actions">
                <button className={`action-btn ${isLiked ? "liked" : ""}`} onClick={() => toggleLike(post.id, post.likes || [])}>
                  <Icon d={Icons.heart} size={16} fill={isLiked ? "currentColor" : "none"} stroke={isLiked ? "none" : "currentColor"} />
                  {likeCount}
                </button>
                <button className="action-btn" onClick={() => handleOpenComments(post.id)}>
                  <Icon d={Icons.messageCircle} size={16} /> {commentCount}
                </button>
                <button className="action-btn" style={{ marginLeft: "auto" }} onClick={() => handleShare(post.id)}>
                  <Icon d={Icons.send} size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {activeCommentPostId && (
        <div className="modal-overlay" onClick={() => setActiveCommentPostId(null)} style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "480px", height: "85vh", background: "var(--bg)", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", display: "flex", flexDirection: "column", paddingBottom: "100px" }}>
            
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Comments 💬</span>
              <button onClick={() => setActiveCommentPostId(null)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer" }}>
                <Icon d={Icons.x} size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {postComments.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text3)", marginTop: 20, fontSize: 13 }}>Be the first to reply ✨</div>
              ) : (
                postComments.map((c, i) => (
                  <div key={i} className="comment-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="avatar avatar-sm" style={{ width: 28, height: 28, fontSize: 12 }}>{c.author?.full_name?.[0] || "U"}</div>
                    <div className="comment-bubble">
                      <div className="comment-name">{c.author?.full_name || "Traveler"}</div>
                      <div className="comment-text">{c.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: "16px", borderTop: "1px solid var(--border)", background: "var(--surface2)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="leave a reply..." 
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "99px", background: "var(--bg)", border: "1px solid var(--border)", color: "white", outline: "none", fontSize: "14px" }}
                />
                <button 
                  onClick={handleSendComment} 
                  style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, var(--violet), #c46fff)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                >
                  <Icon d={Icons.send} size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}