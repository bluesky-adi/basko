"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Spaces() {
  const [spaces, setSpaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSpaces()
  }, [])

  const fetchSpaces = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('spaces')
      .select(`*, host:profiles(full_name)`)
      .eq('status', 'active')
    if (data) setSpaces(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans px-6 md:px-12">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto pt-10 mb-8 flex items-end justify-between">
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Squad</h1>
            <p className="text-gray-500 mt-2">Join a trip group or create your own adventure.</p>
         </div>
         <Button 
            onClick={() => router.push("/create")} 
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-6"
         >
            + Create New Trip
         </Button>
      </div>

      {/* GRID LAYOUT */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <p className="text-gray-400">Loading squads...</p>
        ) : (
            spaces.map((space) => (
                // ✨ THE SPACE CARD
                <div key={space.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full">
                    
                    {/* Image Area */}
                    <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                        <img 
                            src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=800&auto=format&fit=crop" 
                            className="w-full h-full object-cover" 
                            alt="Dest" 
                        />
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-sm">
                            3 Spots Left
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{space.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            Hosted by <span className="font-semibold text-gray-900">{space.host?.full_name}</span>
                        </p>
                        
                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                             <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-violet-500" />
                                <span className="font-medium">{space.start_date}</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-violet-500" />
                                <span className="font-medium">₹{space.budget}</span>
                             </div>
                        </div>
                        
                        {/* Tags */}
                        {space.girls_only && (
                            <div className="mt-3 inline-block bg-pink-50 text-pink-600 text-xs font-bold px-2 py-1 rounded-md">
                                Girls Only 🎀
                            </div>
                        )}
                    </div>

                    {/* Footer Button */}
                    <button 
                        onClick={() => router.push(`/chat/${space.id}`)}
                        className="w-full mt-4 bg-gray-50 hover:bg-violet-50 text-gray-900 hover:text-violet-700 font-semibold py-2.5 rounded-lg transition-colors text-sm border border-gray-200 hover:border-violet-200"
                    >
                        View Details
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  )
}