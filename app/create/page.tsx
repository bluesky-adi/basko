"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" 
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, MapPin, ImagePlus, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreatePost() {
  const [content, setContent] = useState("")
  const [city, setCity] = useState("")
  const [file, setFile] = useState<File | null>(null) // To hold the image
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePost = async () => {
    if (!content) return alert("Write something first!")
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let imageUrl = null

    // 1. Upload Image (If selected)
    if (file) {
      const fileName = `post-${user.id}-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('uploads') // We reuse the 'uploads' bucket
        .upload(fileName, file)

      if (uploadError) {
        alert("Image upload failed!")
        setLoading(false)
        return
      }

      // Get the URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)
        
      imageUrl = publicUrl
    }

    // 2. Insert Post into DB
    const { error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content: content,
        city_tag: city || null,
        image_url: imageUrl, // Save the link
        likes_count: 0
      })

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/spaces") 
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-md flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Button>
        <h1 className="text-xl font-bold ml-4">New Trip Plan ✈️</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 space-y-6">
        
        {/* City Input */}
        <div className="space-y-2">
            <Label className="text-gray-500 font-medium">Where are you going?</Label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-basko-brand" />
                <Input 
                    placeholder="e.g. Jaipur, Goa" 
                    className="pl-9 h-12 rounded-xl bg-gray-50 border-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </div>
        </div>

        {/* Content Input */}
        <div className="space-y-2">
            <Label className="text-gray-500 font-medium">What's the plan?</Label>
            <Textarea 
                className="w-full h-32 p-4 rounded-xl bg-gray-50 border-none resize-none focus:ring-2 focus:ring-basko-brand/20 outline-none"
                placeholder="Share your itinerary or ask for recommendations..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
        </div>

        {/* Image Upload Button */}
        <div className="space-y-2">
           <Label className="text-gray-500 font-medium">Add a Photo</Label>
           {!file ? (
             <div className="relative">
               <input 
                 type="file" 
                 accept="image/*"
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                 onChange={(e) => setFile(e.target.files?.[0] || null)}
               />
               <Button variant="outline" className="w-full h-12 border-dashed border-2 rounded-xl text-gray-500 gap-2">
                 <ImagePlus className="w-5 h-5" /> Tap to upload image
               </Button>
             </div>
           ) : (
             <div className="relative">
               <img src={URL.createObjectURL(file)} className="w-full h-40 object-cover rounded-xl" />
               <Button 
                 size="icon" 
                 variant="destructive" 
                 className="absolute top-2 right-2 rounded-full w-8 h-8"
                 onClick={() => setFile(null)}
               >
                 <X className="w-4 h-4" />
               </Button>
             </div>
           )}
        </div>

        <Button 
            onClick={handlePost} 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-basko-brand hover:bg-basko-glow text-white font-bold text-lg shadow-lg"
        >
            {loading ? <Loader2 className="animate-spin" /> : "Post it 🚀"}
        </Button>

      </div>
    </div>
  )
}