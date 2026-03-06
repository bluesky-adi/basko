"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Calendar, IndianRupee, Users, AlignLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateSpace() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    maxMembers: "5",
    isGirlsOnly: false
  })
  
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
        return alert("Please fill in Title, Destination, Budget, and BOTH Dates!")
    }

    const members = parseInt(formData.maxMembers)
    if (members < 2 || members > 60) return alert("Group size must be between 2 and 60 people.")

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('spaces')
      .insert({
        host_id: user.id,
        title: formData.title,
        destination_city: formData.destination,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget_per_person: parseInt(formData.budget),
        max_members: members,
        is_girls_only: formData.isGirlsOnly,
        status: 'active'
      })
      .select()

    if (error) {
      alert("Save Failed: " + error.message)
    } else {
      if (data && data[0]) {
          await supabase.from('space_members').insert({
              space_id: data[0].id,
              user_id: user.id,
              status: 'approved'
          })
          router.push("/spaces")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Start a Squad ⛺</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 space-y-6">
        <div className="space-y-2">
            <Label>Trip Title</Label>
            <Input placeholder="e.g. Manali New Years Madness" className="h-12 rounded-xl bg-gray-50 border-none" onChange={(e) => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="space-y-2">
            <Label>Destination</Label>
            <Input placeholder="e.g. Manali, Himachal" className="h-12 rounded-xl bg-gray-50 border-none" onChange={(e) => setFormData({...formData, destination: e.target.value})} />
        </div>
        <div className="space-y-2">
            <Label>Trip Plan / Bio</Label>
            <div className="relative">
                <AlignLeft className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Textarea placeholder="What's the vibe?" className="pl-9 min-h-[100px] rounded-xl bg-gray-50 border-none resize-none" onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Start Date</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="date" className="pl-9 h-12 rounded-xl bg-gray-50 border-none" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>End Date</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="date" className="pl-9 h-12 rounded-xl bg-gray-50 border-none" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input type="number" placeholder="5000" className="pl-9 h-12 rounded-xl bg-gray-50 border-none" onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Max People</Label>
                <div className="relative">
                    <Users className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input type="number" max={60} placeholder="5" className="pl-9 h-12 rounded-xl bg-gray-50 border-none" onChange={(e) => setFormData({...formData, maxMembers: e.target.value})} />
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl border border-pink-100">
            <div className="space-y-0.5">
                <Label className="text-pink-700 font-bold">Girls Only Squad?</Label>
                <p className="text-xs text-pink-500">Visible to everyone, but <span className="font-bold">only girls can join.</span></p>
            </div>
            <input type="checkbox" className="w-6 h-6 accent-pink-500" onChange={(e) => setFormData({...formData, isGirlsOnly: e.target.checked})} />
        </div>
        <Button onClick={handleCreate} disabled={loading} className="w-full h-12 rounded-xl bg-basko-brand hover:bg-basko-glow text-white font-bold text-lg shadow-lg">
            {loading ? <Loader2 className="animate-spin" /> : "Launch Squad 🚀"}
        </Button>
      </div>
    </div>
  )
}