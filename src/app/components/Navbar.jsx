"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { signOut, signInWithPopup } from 'firebase/auth'
import { useAuth } from '../utils/auth'
import { Auth, Provider } from '../lib/Firebase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAuth()
  const isLoading = user === undefined  // undefined = Firebase still resolving

  const handleSignIn = async () => {
    try {
      await signInWithPopup(Auth, Provider)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(Auth)
      setMenuOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <nav className="border-b border-zinc-800/60 bg-[#111111] px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base">
            ⌨️
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Typing Speed Test</p>
            <p className="text-zinc-600 text-xs">Type as fast as you can</p>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/"
            className="text-zinc-400 hover:text-white text-sm font-mono transition-colors">
            Play
          </Link>
          <Link href="/leaderboard"
            className="text-zinc-400 hover:text-white text-sm font-mono transition-colors">
            Leaderboard
          </Link>
        </div>

        {/* ── Auth section ── */}
        <div className="flex items-center gap-3">

          {/* ── Loading skeleton — same shape as signed-in button ── */}
          {/* This prevents the guest → signed-in flicker on refresh   */}
          {isLoading && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse" />
              <div className="w-20 h-3 rounded-md bg-zinc-800 animate-pulse hidden sm:block" />
              <div className="w-3 h-3 rounded bg-zinc-800 animate-pulse" />
            </div>
          )}

          {/* ── Guest — confirmed not signed in ── */}
          {!isLoading && !user && (
            <div className="flex items-center gap-3">
              <span className="text-zinc-600 text-xs font-mono hidden sm:block">
                Guest mode
              </span>
      
              <button
                onClick={() => router.push('/auth')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-sm font-semibold transition-all duration-200"
              >
                Sign in with email
              </button>
            </div>
          )}

          {/* ── Logged in — profile pic + dropdown ── */}
          {!isLoading && user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all duration-200 group"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={28}
                    height={28}
                    className="rounded-full object-cover ring-1 ring-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-zinc-300 text-sm font-medium hidden sm:block max-w-30 truncate">
                  {user.displayName || user.email}
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={`text-zinc-600 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden">

                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-white text-sm font-semibold truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-zinc-500 text-xs truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/leaderboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <span>🏆</span> Leaderboard
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <span>⌨️</span> Play
                      </Link>
                    </div>

                    <div className="border-t border-zinc-800 py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors text-left"
                      >
                        <span>↩</span> Sign out
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}

export default Navbar