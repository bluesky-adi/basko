<h1 className="text-red-500 text-4xl">TEST UI CHANGE</h1>
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Heart, MessageSquare, Share2, MoreHorizontal, Moon, Sun } from "lucide-react"

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPosts()

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

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
    <div className="min-h-screen relative">

      {/* 🌌 BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#1a1a2e,_#0f111a)]" />
      <div className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full -z-10" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[var(--background)]/60 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-6">

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-xl font-semibold">Basko</span>
        </div>

        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-sm flex items-center gap-2"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

      </nav>

      {/* MAIN */}
      <main className="max-w-[720px] mx-auto px-4 pt-8 pb-24 space-y-8">

        <div>
          <h1 className="text-3xl font-semibold">Travel Feed</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Discover trips, ideas, and stories.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="
              bg-white/5
              backdrop-blur-xl
              rounded-2xl
              p-5
              border border-white/10
              shadow-lg
              hover:scale-[1.01]
              transition
            "
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                    {post.author?.full_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.author?.full_name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {post.author?.college_name}
                    </p>
                  </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              {/* TITLE */}
              <h2 className="text-lg font-semibold mb-2">
                {post.city_tag ? `Trip to ${post.city_tag}` : "Travel Story"}
              </h2>

              {/* CONTENT */}
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                {post.content}
              </p>

              {/* IMAGE */}
              {post.image_url && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img
                    src={post.image_url}
                    className="w-full h-[220px] object-cover hover:scale-110 transition duration-700"
                  />
                </div>
              )}

              {/* TAGS */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {post.city_tag && (
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                    #{post.city_tag}
                  </span>
                )}
                <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-gray-300">
                  #Basko
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between border-t border-white/10 pt-4">

                <div className="flex gap-6 text-sm">
                  <button className="flex items-center gap-2 text-rose-400">
                    <Heart className="w-5 h-5 fill-rose-400" />
                    45
                  </button>

                  <button className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                    12
                  </button>
                </div>

                <div className="flex gap-4 text-gray-400">
                  <Share2 className="w-5 h-5 hover:text-purple-400" />
                  <Heart className="w-5 h-5 hover:text-purple-400" />
                </div>

              </div>

            </div>
          ))
        )}
      </main>
    </div>
  )
}