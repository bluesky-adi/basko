"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Flag, AlertTriangle } from "lucide-react"

// You pass 'targetId' (which trip/user is bad) and 'type' (context)
export default function ReportModal({ targetId, targetName }: { targetId: string, targetName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleReport = async () => {
    if (!reason) return alert("Please explain the reason.")
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        const { error } = await supabase.from('reports').insert({
            reporter_id: user.id,
            target_id: targetId,
            reason: reason,
            status: 'pending'
        })

        if (error) {
            alert("Error reporting: " + error.message)
        } else {
            alert("Report submitted. Our safety team will review this.")
            setIsOpen(false)
            setReason("")
        }
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* The Trigger Button - Small and Subtle */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-8 px-2">
            <Flag className="w-3 h-3 mr-1" /> Report
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" /> Report Issue
            </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
                You are reporting <span className="font-bold">{targetName}</span>. 
                This will be sent to the Basko Safety Team immediately.
            </p>
            
            <Textarea 
                placeholder="Describe the issue (e.g., Fake ID, Harassment, Illegal items)..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-32"
            />

            <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleReport}
                disabled={loading}
            >
                {loading ? "Sending..." : "Submit Report"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}