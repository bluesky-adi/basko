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
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  const supabase = createClient()

  useEffect(() => { fetchFeed() }, [])

  const fetchFeed = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
    
    const { data } = await supabase
      .from('posts')
      .select(`*, author:profiles(full_name, avatar_url), likes:post_likes(user_id), comments:comments(id)`)
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  // ✨ FIX: Robust Delete Logic
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post permanently? 🛑")) return
    
    // 1. Tell Supabase to delete it
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', currentUserId) // Double check ownership

    if (error) {
      console.error("Delete error:", error)
      alert("Database error: " + error.message)
    } else {
      // 2. Clear state locally so it disappears immediately
      setPosts(prev => prev.filter(p => p.id !== postId))
      setOpenDropdownId(null)
      alert("Post deleted successfully ✨")
      
      // 3. Re-fetch just to be 100% sure we are synced with server
      await fetchFeed()
    }
  }

  const handleReportPost = async (postId: string) => {
    const reason = window.prompt("Reason for reporting? (e.g. Spam, Offensive)")
    if (!reason) return
    
    if (currentUserId) {
      const { error } = await supabase.from('reports').insert({ 
        reporter_id: currentUserId, 
        post_id: postId, 
        reason: reason 
      })
      if (!error) {
        alert("Reported! Moderators will review this. 🛡️")
        setOpenDropdownId(null)
      }
    }
  }

  const handleJoinTrip = async (trip: any) => {
    if (!currentUserId) return router.push('/')
    const { data: profile } = await supabase.from('profiles').select('gender').eq('id', currentUserId).single()

    if (trip.girls_only && profile?.gender !== 'female') {
      return alert("Sorry! This is a Girls-Only trip 🌸.")
    }

    const { error } = await supabase.from('space_members').insert({
      space_id: trip.id, user_id: currentUserId, status: 'pending'
    })
    if (error) alert("Error sending request.")
    else alert("Request sent! ✨")
  }

  const toggleLike = async (postId: string, currentLikes: any[]) => {
    if (!currentUserId) return
    const hasLiked = currentLikes.some((l: any) => l.user_id === currentUserId)
    
    // Optimistic UI update
    setPosts(posts.map(p => p.id === postId ? { 
      ...p, 
      likes: hasLiked ? p.likes.filter((l:any) => l.user_id !== currentUserId) : [...p.likes, { user_id: currentUserId }] 
    } : p))

    if (hasLiked) { 
        await supabase.from('post_likes').delete().match({ user_id: currentUserId, post_id: postId }) 
    } else { 
        await supabase.from('post_likes').insert({ user_id: currentUserId, post_id: postId }) 
    }
  }

  const handleOpenComments = async (postId: string) => {
    setActiveCommentPostId(postId)
    setPostComments([]) 
    const { data } = await supabase.from('comments').select(`*, author:profiles(full_name, avatar_url)`).eq('post_id', postId).order('created_at', { ascending: true })
    if (data) setPostComments(data)
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || !activeCommentPostId || !currentUserId) return
    const content = newComment
    setNewComment("")
    await supabase.from('comments').insert({ post_id: activeCommentPostId, user_id: currentUserId, content })
    handleOpenComments(activeCommentPostId)
  }

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/explore?post=${postId}`
    if (navigator.share) { try { await navigator.share({ title: 'Basko', url: shareUrl }) } catch (err) {} } 
    else { navigator.clipboard.writeText(shareUrl); alert("Link copied! 📋") }
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
          const isMyPost = post.author_id === currentUserId;

          return (
            <div key={post.id} className="glass post-card" style={{ animationDelay: `${i * 0.08}s`, position: "relative" }}>
              <div className="post-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push(`/profile/${post.author_id}`)}>
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
                      <Icon d={Icons.flag} size={16} /> Report Content
                    </button>
                  )}
                </div>
              )}
              
              <div className="post-text">{post.content}</div>
              {post.image_url && <img src={post.image_url} alt="" className="post-img" />}
              
              <div className="post-actions">
                <button className={`action-btn ${isLiked ? "liked" : ""}`} onClick={() => toggleLike(post.id, post.likes || [])}>
                  <Icon d={Icons.heart} size={16} fill={isLiked ? "currentColor" : "none"} stroke={isLiked ? "none" : "currentColor"} />
                  {post.likes?.length || 0}
                </button>
                <button className="action-btn" onClick={() => handleOpenComments(post.id)}>
                  <Icon d={Icons.messageCircle} size={16} /> {post.comments?.length || 0}
                </button>
                <button className="action-btn" style={{ marginLeft: "auto" }} onClick={() => handleShare(post.id)}>
                  <Icon d={Icons.send} size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* COMMENT MODAL */}
      {activeCommentPostId && (
        <div className="modal-overlay" onClick={() => setActiveCommentPostId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Comments 💬</span>
              <button onClick={() => setActiveCommentPostId(null)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer" }}>
                <Icon d={Icons.x} size={20} />
              </button>
            </div>
            <div className="comment-list">
              {postComments.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text3)", marginTop: 20, fontSize: 13 }}>Be the first to reply ✨</div>
              ) : (
                postComments.map((c, i) => (
                  <div key={i} className="comment-row">
                    <div className="avatar avatar-sm">{c.author?.full_name?.[0] || "U"}</div>
                    <div className="comment-bubble">
                      <div className="comment-name">{c.author?.full_name}</div>
                      <div className="comment-text">{c.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: "16px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} placeholder="Reply..." className="chat-input" style={{ flex: 1 }} />
                <button onClick={handleSendComment} className="send-btn">
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