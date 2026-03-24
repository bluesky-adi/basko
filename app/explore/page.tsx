"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  messageCircle: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
};

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
      
      const { data } = await supabase
        .from('posts')
        .select(`*, author:profiles(full_name, avatar_url), likes:post_likes(user_id)`)
        .order('created_at', { ascending: false })
      if (data) setPosts(data)
    }
    init()
  }, [])

  return (
    <div className="page">
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

      <div className="girls-banner fade-up-1">
        <div style={{ fontSize: 32 }}>🎀</div>
        <div>
          <div className="girls-banner-title">Girls Only Space</div>
          <div className="girls-banner-text">A safe, special corner just for you — women-only trips, stories & squad-finds.</div>
        </div>
      </div>

      {posts.map((post, i) => {
        const isLiked = post.likes?.some((l: any) => l.user_id === currentUserId);
        const likeCount = post.likes?.length || 0;

        return (
          <div key={post.id} className="glass post-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="post-header">
              <div className="avatar">{post.author?.full_name?.[0] || "🌸"}</div>
              <div className="post-meta">
                <div className="post-name">{post.author?.full_name || "Traveler"}</div>
                <div className="post-time">Recently</div>
              </div>
            </div>
            
            <div className="post-text">{post.content}</div>
            
            {post.image_url && <img src={post.image_url} alt="" className="post-img" />}
            
            <div className="post-actions">
              <button className={`action-btn ${isLiked ? "liked" : ""}`}>
                <Icon d={Icons.heart} size={16} fill={isLiked ? "currentColor" : "none"} stroke={isLiked ? "none" : "currentColor"} />
                {likeCount}
              </button>
              <button className="action-btn">
                <Icon d={Icons.messageCircle} size={16} /> 12
              </button>
              <button className="action-btn" style={{ marginLeft: "auto" }}>
                <Icon d={Icons.send} size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}