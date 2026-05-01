// utils/auth.js
"use client"
import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { Auth } from "../lib/Firebase"

export function useAuth() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    // Check localStorage first — prevents guest→signed-in flicker on refresh
    const stored = localStorage.getItem(
      `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:[DEFAULT]`
    )

    // Nothing stored = definitely guest, skip loading state
    if (!stored) setUser(null)

    // Always confirm with Firebase
    const unsub = onAuthStateChanged(Auth, (u) => {
      setUser(u || null)
    })

    return () => unsub()
  }, [])

  return user
}