// app/leaderboard/page.jsx
"use client"
import React, { useEffect, useState } from 'react'
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database'
import { rtdb } from '../lib/Firebase'
import { useAuth } from '../utils/auth'
import Link from 'next/link'

export default function Leaderboard() {
  const user                  = useAuth()
  const [scores, setScores]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const leaderRef = query(
      ref(rtdb, "leaderboard"),
      orderByChild("wpm"),
      limitToLast(10)
    )
    const unsub = onValue(leaderRef, (snapshot) => {
      if (!snapshot.exists()) { setScores([]); setLoading(false); return }
      const data = Object.values(snapshot.val()).sort((a, b) => b.wpm - a.wpm)
      setScores(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const medalEmoji = (i) => ["🥇", "🥈", "🥉"][i] || null
  const medalColor = (i) => ["text-yellow-400", "text-zinc-300", "text-amber-600"][i] || "text-zinc-600"
  const diffColor  = (d) => ({
    easy:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    hard:   "text-red-400 bg-red-400/10 border-red-400/20",
  }[d] || "text-zinc-400 bg-zinc-800 border-zinc-700")

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="border-b border-zinc-800/60 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-1">// Scores</p>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Top 10 all-time best scores</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-mono transition-all">
            ← Play
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Guest banner */}
        {!user && user !== undefined && (
          <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-4 mb-8">
            <div>
              <p className="text-white text-sm font-semibold">Playing as guest</p>
              <p className="text-zinc-500 text-xs mt-0.5">Sign in to save your scores and appear here</p>
            </div>
            <Link href="/" className="text-xs font-mono text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-all ml-4">
              Sign in →
            </Link>
          </div>
        )}

        {/* User's own rank card */}
        {user && scores.length > 0 && (() => {
          const myRank = scores.findIndex(s => s.uid === user.uid)
          if (myRank === -1) return (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-4 mb-8">
              <p className="text-zinc-500 text-sm">You haven't made the top 10 yet. Keep playing! 💪</p>
            </div>
          )
          return (
            <div className="flex items-center gap-4 bg-zinc-800/60 border border-zinc-600 rounded-xl px-5 py-4 mb-8">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full ring-2 ring-zinc-500" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold">
                  {user.displayName?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white text-sm font-semibold">{user.displayName}</p>
                <p className="text-zinc-500 text-xs">
                  Your best: <span className="text-white font-bold">{scores[myRank].wpm} WPM</span>
                  {" · "}Rank <span className="text-white font-bold">#{myRank + 1}</span>
                </p>
              </div>
            </div>
          )
        })()}

        {/* Scores table */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm">No scores yet — be the first!</p>
            <Link href="/" className="inline-block mt-4 text-zinc-400 hover:text-white text-sm font-mono">→ Play now</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-12 px-4 pb-2 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Player</span>
              <span className="col-span-2 text-center">WPM</span>
              <span className="col-span-2 text-center">Acc</span>
              <span className="col-span-2 text-right">Diff</span>
            </div>

            {scores.map((score, i) => {
              const isMe = score.uid === user?.uid
              return (
                <div key={score.uid}
                  className={`grid grid-cols-12 items-center px-4 py-4 rounded-xl border transition-all ${
                    isMe ? "bg-zinc-800/80 border-zinc-600" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="col-span-1">
                    {medalEmoji(i)
                      ? <span className="text-xl">{medalEmoji(i)}</span>
                      : <span className={`font-bold font-mono text-sm ${medalColor(i)}`}>{i + 1}</span>
                    }
                  </div>

                  <div className="col-span-5 flex items-center gap-3">
                    {score.photoURL ? (
                      <img src={score.photoURL} alt={score.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {score.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <p className="text-white text-sm font-medium truncate">
                      {score.name}
                      {isMe && <span className="ml-2 text-[10px] text-zinc-500 font-mono">(you)</span>}
                    </p>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="text-white font-bold text-xl tabular-nums">{score.wpm}</span>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="text-red-400 font-mono text-sm tabular-nums">{score.accuracy}%</span>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono capitalize ${diffColor(score.difficulty)}`}>
                      {score.difficulty}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs font-mono text-zinc-600">Updates in real time</span>
        </div>

      </div>
    </div>
  )
}