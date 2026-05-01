"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { Auth, Provider } from "../lib/Firebase"
import Link from "next/link"

// ─── Friendly error messages ──────────────────────────────────────────────────
const friendlyError = (code) => ({
  "auth/email-already-in-use":  "That email is already registered. Try signing in.",
  "auth/invalid-email":          "Please enter a valid email address.",
  "auth/weak-password":          "Password must be at least 6 characters.",
  "auth/user-not-found":         "No account found with that email.",
  "auth/wrong-password":         "Incorrect password. Please try again.",
  "auth/invalid-credential":     "Incorrect email or password.",
  "auth/too-many-requests":      "Too many attempts. Please wait a moment.",
}[code] || "Something went wrong. Please try again.")

// ─── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter()

  const [tab, setTab]           = useState("signin")   // "signin" | "register"
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Redirect if already signed in
  useEffect(() => {
    const unsub = onAuthStateChanged(Auth, (u) => {
      if (u) router.replace("/")
    })
    return () => unsub()
  }, [router])

  // ── Email / Password ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (tab === "register") {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return }
        const result = await createUserWithEmailAndPassword(Auth, email, password)
        await updateProfile(result.user, { displayName: name.trim() })
      } else {
        await signInWithEmailAndPassword(Auth, email, password)
      }
      router.replace("/")
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  // ── Google Sign In ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await signInWithPopup(Auth, Provider)
      router.replace("/")
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(friendlyError(err.code))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // ── Input class ─────────────────────────────────────────────────────────────
  const inputCls = `
    w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3
    text-white text-sm placeholder-zinc-600
    focus:outline-none focus:border-zinc-500 focus:bg-zinc-800/60
    transition-all duration-200
  `

  return (
    <div
      className="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-4"
    >
      <div className="w-full max-w-md">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg">
            ⌨️
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Typing Speed Test</p>
            <p className="text-zinc-600 text-xs">Track your progress</p>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-7 shadow-2xl">

          {/* ── Header ── */}
          <div className="mb-6">
            <h1 className="text-white font-bold text-xl">
              {tab === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {tab === "signin"
                ? "Sign in to save your scores and appear on the leaderboard"
                : "Register to track your progress and compete globally"}
            </p>
          </div>

          {/* ── Google button ── */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium transition-all duration-200 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : <GoogleIcon />}
            Continue with Google
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs font-mono">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl mb-5">
            {["signin", "register"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError("") }}
                className={`flex-1 py-2 rounded-lg text-sm font-mono transition-all duration-150 ${
                  tab === t
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name — register only */}
            {tab === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-500">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (shown on leaderboard)"
                  autoComplete="name"
                  required
                  className={inputCls}
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete={tab === "signin" ? "email" : "new-email"}
                required
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "Min. 6 characters" : "Your password"}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                required
                className={inputCls}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition-all duration-200 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Please wait...
                </>
              ) : (
                tab === "signin" ? "Sign In" : "Create Account"
              )}
            </button>

          </form>

          {/* ── Switch tab ── */}
          <p className="text-center text-zinc-600 text-xs font-mono mt-5">
            {tab === "signin" ? "No account? " : "Already registered? "}
            <button
              onClick={() => { setTab(tab === "signin" ? "register" : "signin"); setError("") }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {tab === "signin" ? "Register here" : "Sign in"}
            </button>
          </p>

        </div>

        {/* ── Back to game ── */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors"
          >
            ← Play without account
          </Link>
          <span className="text-zinc-800">·</span>
          <Link
            href="/leaderboard"
            className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors"
          >
            View leaderboard
          </Link>
        </div>

      </div>
    </div>
  )
}