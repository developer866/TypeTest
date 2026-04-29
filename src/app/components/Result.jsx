// components/Result.jsx
"use client"
import React, { useEffect, useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { Auth, Provider } from '../lib/Firebase'
import { useAuth } from '../utils/auth'
import { saveScore } from '../utils/score'
import Link from 'next/link'

function Result({ wpm, accuracy, difficulty, mode, duration, restart }) {
  const user                = useAuth()
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)

  // Auto-save when user is logged in — also fires if guest signs in from this screen
  useEffect(() => {
    const save = async () => {
      if (!user || saved || saving) return
      setSaving(true)
      const id = await saveScore(user, { wpm, accuracy, difficulty, mode, duration })
      if (id) setSaved(true)
      setSaving(false)
    }
    save()
  }, [user])

  const handleSignIn = async () => {
    try {
      await signInWithPopup(Auth, Provider)
      // user state updates → useEffect fires → score auto-saves
    } catch (err) { console.error(err) }
  }

  const GoogleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">

        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-2xl">⌨️</span>
          <span className="font-bold text-white text-xl">Typing Speed Test</span>
        </div>

        <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase mb-4">Test complete</p>

        <h1 className="text-7xl font-bold text-white mb-2">
          {wpm}
          <span className="text-3xl text-zinc-500 font-normal ml-2">WPM</span>
        </h1>

        {/* Save status row */}
        <div className="h-9 flex items-center justify-center mt-2 mb-4">
          {saving && <p className="text-zinc-500 text-xs font-mono animate-pulse">Saving score...</p>}
          {saved  && <p className="text-emerald-400 text-xs font-mono">✓ Score saved to leaderboard</p>}
          {!user && !saving && !saved && (
            <button onClick={handleSignIn}
              className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all">
              <GoogleIcon /> Sign in with Google to save this score
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 my-8">
          {[
            { label: "WPM",      value: wpm,            color: "text-white"       },
            { label: "Accuracy", value: `${accuracy}%`, color: "text-red-400"     },
            { label: "Duration", value: `${duration}s`, color: "text-yellow-400"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl py-6">
              <p className={`text-4xl font-bold ${color} mb-1`}>{value}</p>
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10">
          {[
            { label: "Difficulty", value: difficulty },
            { label: "Mode", value: mode === "passage" ? "Passage" : `Timed (${duration}s)` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-3 flex justify-between items-center">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{label}</span>
              <span className="text-sm font-mono text-zinc-300 capitalize">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={restart}
            className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-white rounded-xl font-medium transition-all">
            Try again ↺
          </button>
          <Link href="/leaderboard"
            className="px-8 py-3 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl font-semibold text-sm transition-all">
            View Leaderboard →
          </Link>
        </div>

        <p className="text-zinc-700 text-xs font-mono mt-5">Press Tab to restart</p>
      </div>
    </div>
  )
}

export default Result