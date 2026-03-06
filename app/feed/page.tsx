"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Heart, MessageSquare, Share2, MoreHorizontal, Moon, Sun } from "lucide-react"

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false) // State for the toggle
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
    // Check system preference on load
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Manual Toggle Function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select(`*, author:profiles(full_name, college_name)`)
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
    setLoading(false)
  }

  return (
    // Main Wrapper
    <div className="min-h-screen transition-colors duration-300">
      
      {/* 1. Header (Matches your Screenshot) */}
      <nav className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md h-20 flex items-center justify-between px-6 md:px-12 transition-colors duration-300">
        <div className="flex items-center gap-2">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">Basko</span>
        </div>
        
        <div className="flex items-center gap-4">
             {/* THEME TOGGLE BUTTON */}
             <button 
                onClick={toggleTheme}
                className="px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-sm font-medium flex items-center gap-2 shadow-sm"
             >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
             </button>
             
             {/* Menu Button (Visual Only) */}
             <button className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium">
                Menu ▾
             </button>
        </div>
      </nav>

      {/* 2. Main Content Column (Restricted Width for 'Feed' Look) */}
      <main className="max-w-[800px] mx-auto px-6 pt-8 pb-24 space-y-8">
        
        {/* Title Section */}
        <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight">Travel Feed</h1>
            <p className="text-[var(--muted-foreground)]">Discover tips, itineraries and stories from fellow travelers.</p>
        </div>

        {/* FEED LOOP */}
        {loading ? (
             <div className="py-20 text-center text-[var(--muted-foreground)]">Loading feed...</div>
        ) : (
          posts.map((post) => (
            // ✨ THE CARD (Matches your Screenshot Layout)
            <div key={post.id} className="bg-[var(--card)] rounded-2xl p-6 shadow-sm border border-[var(--border)] transition-all">
                
                {/* A. Card Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                            {/* If user has image, show it, otherwise initial */}
                            <span className="text-violet-600 font-bold text-lg">{post.author?.full_name?.[0]}</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[var(--foreground)] leading-none">
                                {post.author?.full_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                <p className="text-xs text-[var(--muted-foreground)]">{post.author?.college_name || "Traveler"}</p>
                            </div>
                        </div>
                    </div>
                    <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* B. Title & Content */}
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                         {/* We fake a title if none exists, to match the screenshot vibe */}
                        {post.city_tag ? `Weekend Trip to ${post.city_tag}!` : "My Travel Adventure"}
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {post.content}
                    </p>
                </div>

                {/* C. Wide Cinematic Image */}
                {post.image_url && (
                    <div className="w-full aspect-[21/9] rounded-xl overflow-hidden mb-5 bg-gray-100">
                        <img 
                            src={post.image_url} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                            alt="Post Media" 
                        />
                    </div>
                )}

                {/* D. Footer (Hashtags + Stats) */}
                <div>
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-violet-600">
                        {post.city_tag && <span>#{post.city_tag.replace(/\s/g, '')}</span>}
                        <span>#StudentTravel</span>
                        <span>#Basko</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                        
                        {/* Left: Likes & Comments (Text) */}
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-sm font-semibold text-rose-500">
                                <Heart className="w-5 h-5 fill-rose-500" />
                                <span>45 Likes</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                                <MessageSquare className="w-5 h-5" />
                                <span>12 Comments</span>
                            </button>
                        </div>

                        {/* Right: Action Icons */}
                        <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
                             <button className="hover:text-[var(--foreground)]"><MessageSquare className="w-5 h-5" /></button>
                             <button className="hover:text-[var(--foreground)]"><Share2 className="w-5 h-5" /></button>
                             <button className="hover:text-[var(--foreground)]"><Heart className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

            </div>
          ))
        )}
      </main>
    </div>
  )
}