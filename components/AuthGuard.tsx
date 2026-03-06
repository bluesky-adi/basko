"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Stop the button from clicking

    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Not Logged In? -> Go to Login
    if (!user) {
        return router.push("/")
    }

    // 2. Logged In but Not Verified? -> Show Popup
    const { data: profile } = await supabase.from('profiles').select('is_verified').eq('id', user.id).single()
    
    if (!profile || profile.is_verified === false) {
        setOpen(true) // Show the "Stop" popup
    } else {
        // 3. Verified? -> Allow the click (Manual trigger needed if wrapping a button, 
        // but usually we wrap the logic or use this as a gate)
        // For simple buttons, we might need to pass the onClick handler to this component instead.
    }
  }

  return (
    <>
      <div onClickCapture={handleClick} className="inline-block">
        {children}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Verification Required 🔒</AlertDialogTitle>
            <AlertDialogDescription>
              To keep our community safe, only <strong>verified students</strong> can perform this action.
              <br/><br/>
              It takes 30 seconds to upload your ID card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                className="bg-basko-brand"
                onClick={() => router.push("/dashboard")}
            >
                Verify ID Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}