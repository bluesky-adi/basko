"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UploadCloud, CheckCircle, ShieldCheck } from "lucide-react" // Added ShieldCheck
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState("")
  const [college, setCollege] = useState("")
  const [gender, setGender] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false) // <--- 1. NEW STATE
  const [status, setStatus] = useState("loading") 
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // ... (Keep your existing checkProfile logic exactly the same) ...
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push("/")
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile && profile.full_name) {
        if (profile.is_verified === true) router.push("/spaces")
        else setStatus("verified") 
      } else {
        setStatus("new")
      }
    }
    checkProfile()
  }, [router])

  const handleUpload = async () => {
    // 2. NEW CHECK: User MUST agree
    if (!agreed) return alert("You must agree to the Terms & Safety Guidelines to continue.")

    if (!file || !fullName || !college || !gender) return alert("Please fill all details!")
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // ... (Keep your existing upload logic exactly the same) ...
    const fileName = `${user.id}-${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file)
    if (uploadError) { setLoading(false); return alert(uploadError.message) }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        college_name: college,
        gender: gender,
        student_id_url: publicUrl,
        is_verified: false 
      })

    if (dbError) alert(dbError.message)
    else setStatus("verified")
    setLoading(false)
  }

  if (status === "loading") return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  if (status === "verified") {
    // ... (Keep existing verified view) ...
    return (
      <div className="flex h-screen items-center justify-center bg-green-50">
        <div className="text-center space-y-4">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-green-700">Application Received!</h1>
          <p className="text-gray-600">We are verifying your ID. Access will unlock shortly.</p>
          <Button variant="outline" onClick={() => router.push("/")}>Back Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="bg-basko-brand text-white rounded-t-xl">
          <CardTitle>Complete your Profile 🎓</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Aditya Kumar" onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>College / University Name</Label>
            <Input placeholder="IIT Delhi" onChange={(e) => setCollege(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <select 
                className="w-full h-12 rounded-xl border border-gray-200 px-3 bg-white disabled:opacity-50"
                onChange={(e) => setGender(e.target.value)}
                defaultValue=""
                disabled={loading}
            >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Upload Student ID Card</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition relative overflow-hidden">
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 relative z-10">{file ? <span className="text-basko-brand font-bold">{file.name}</span> : "Click to upload image"}</p>
            </div>
          </div>

          {/* 3. NEW LEGAL CHECKBOX SECTION */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
                <input 
                    type="checkbox" 
                    id="terms" 
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-basko-brand focus:ring-basko-brand"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    I agree to the <span className="font-bold text-blue-700 underline">Terms of Service</span>. I confirm I am a college student. I understand Basko is an intermediary platform and is <span className="font-bold">not responsible</span> for offline incidents.
                </label>
            </div>
          </div>

          <Button onClick={handleUpload} disabled={loading} className="w-full bg-basko-text text-white h-12 text-lg">
            {loading ? <Loader2 className="animate-spin" /> : "Submit for Verification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}