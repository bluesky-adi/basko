"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function EditSpace({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSpace()
  }, [])

  const fetchSpace = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push("/")

    // Fetch the space ONLY if I am the host
    const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', params.id)
        .eq('host_id', user.id) // Security check
        .single()

    if (error || !data) {
        alert("Trip not found or you are not the host.")
        router.push("/my-spaces")
    } else {
        setFormData(data)
        setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    const { error } = await supabase
        .from('spaces')
        .update({
            title: formData.title,
            destination_city: formData.destination_city,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            budget_per_person: formData.budget_per_person
        })
        .eq('id', params.id)

    if (error) {
        alert("Error updating: " + error.message)
    } else {
        router.push("/my-spaces") // Go back to dashboard
    }
    setSaving(false)
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Edit Trip ✏️</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div>
            <Label>Trip Title</Label>
            <Input 
                value={formData.title || ""} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>City</Label>
                <Input 
                    value={formData.destination_city || ""} 
                    onChange={(e) => setFormData({...formData, destination_city: e.target.value})} 
                />
            </div>
            <div>
                <Label>Budget (₹)</Label>
                <Input 
                    type="number"
                    value={formData.budget_per_person || ""} 
                    onChange={(e) => setFormData({...formData, budget_per_person: e.target.value})} 
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Start Date</Label>
                <Input 
                    type="date"
                    value={formData.start_date || ""} 
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
                />
            </div>
            <div>
                <Label>End Date</Label>
                <Input 
                    type="date"
                    value={formData.end_date || ""} 
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})} 
                />
            </div>
        </div>

        <div>
            <Label>Description</Label>
            <Textarea 
                className="h-32"
                value={formData.description || ""} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
        </div>

        <div className="flex gap-3 pt-4">
            <Button variant="outline" className="w-1/2" onClick={() => router.back()}>Cancel</Button>
            <Button className="w-1/2 bg-basko-brand" onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </div>
    </div>
  )
}