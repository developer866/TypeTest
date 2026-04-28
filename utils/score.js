// utils/scores.js
import { db, rtdb } from "../src/app/lib/Firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, set, get, orderByChild, query, limitToLast } from "firebase/database"

// ── Save full score history to Firestore ─────────────────────────────────────
export const saveScore = async (user, { wpm, accuracy, difficulty, mode, duration }) => {
  if (!user) return null

  try {
    const docRef = await addDoc(collection(db, "scores"), {
      uid:        user.uid,
      name:       user.displayName || "Anonymous",
      photoURL:   user.photoURL    || null,
      email:      user.email,
      wpm,
      accuracy,
      difficulty:difficulty  || "medium",
      mode,
      duration,
      createdAt:  serverTimestamp(),
    })

    // Also update leaderboard if this is a new personal best
    await updateLeaderboard(user, wpm, accuracy, difficulty)

    return docRef.id
  } catch (err) {
    console.error("Failed to save score:", err)
    return null
  }
}

// ── Update Realtime Database — only if new WPM is higher ─────────────────────
// utils/scores.js

export const updateLeaderboard = async (user, wpm, accuracy, difficulty) => {
  if (!user) return

  try {
    const userRef  = ref(rtdb, `leaderboard/${user.uid}`)
    const snapshot = await get(userRef)
    const existing = snapshot.val()

    if (!existing || wpm > existing.wpm) {
      // ✅ Build the object first, only include photoURL if it exists
      const entry = {
        uid:        user.uid,
        name:       user.displayName || "Anonymous",
        wpm,
        accuracy,
        difficulty: difficulty || "medium",
        updatedAt:  Date.now(),
      }

      // Only add photoURL if it's an actual string — Realtime DB hates null
      if (user.photoURL) {
        entry.photoURL = user.photoURL
      }

      await set(userRef, entry)
    }
  } catch (err) {
    console.error("Failed to update leaderboard:", err)
  }
}
// ── Fetch top scores from Realtime Database ───────────────────────────────────
export const getLeaderboard = async (limitCount = 10) => {
  try {
    const leaderRef = query(
      ref(rtdb, "leaderboard"),
      orderByChild("wpm"),
      limitToLast(limitCount)
    )
    const snapshot = await get(leaderRef)
    if (!snapshot.exists()) return []

    return Object.values(snapshot.val()).sort((a, b) => b.wpm - a.wpm)
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err)
    return []
  }
}