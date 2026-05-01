"use client"
import { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
// import { useAuth } from '../utils/auth'
import {useAuth} from "./utils/auth"
import { saveScore } from './utils/score'
import { signInWithPopup } from 'firebase/auth'
import { Auth, Provider } from './lib/Firebase'
import Link from 'next/link'

// ─── Passages ─────────────────────────────────────────────────────────────────
const passages = {
  easy: [
    "the quick brown fox jumps over the lazy dog near the river bank where the cool water flows gently between the smooth rocks and tall green trees line the path ahead",
    "practice makes perfect and every great developer started by writing small programs and fixing tiny bugs one line at a time until the skills became second nature",
    "she sells sea shells by the sea shore and the shells she sells are surely the finest quality found along the beautiful golden coast in the warm summer breeze",
  ],
  medium: [
    "the archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks obsidian from Anatolia lapis lazuli from Afghanistan and amber from the Baltic all discovered in a single Mycenaean tomb suggested commercial connections far more extensive than previously hypothesized",
    "asynchronous programming allows multiple operations to run concurrently without blocking the main thread which significantly improves application performance and user experience in modern web development frameworks",
    "the fundamental theorem of calculus establishes a connection between differentiation and integration providing a practical method for evaluating definite integrals using antiderivatives across a closed interval",
  ],
  hard: [
    "encapsulation polymorphism inheritance and abstraction form the four pillars of object oriented programming enabling developers to write modular reusable and maintainable codebases that scale effectively across large distributed systems",
    "the Byzantine Generals Problem illustrates the challenge of achieving consensus in distributed systems where some participants may behave maliciously or fail unpredictably during communication requiring fault tolerant algorithms",
    "photosynthesis converts electromagnetic radiation into chemical energy through a series of light dependent and light independent reactions occurring within the chloroplasts of eukaryotic plant cells using chlorophyll pigments",
  ],
}

const getRandom = (diff) => {
  const pool = passages[diff] ?? passages.medium
  return pool[Math.floor(Math.random() * pool.length)]
}

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, "0")}`
}

// ─── Invisible Input ───────────────────────────────────────────────────────────
const TypingInput = forwardRef(function TypingInput({ typed, onChange, onRestart }, ref) {
  useEffect(() => {
    const t = setTimeout(() => ref?.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <input
      ref={ref}
      value={typed}
      onChange={onChange}
      autoFocus
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck="false"
      data-gramm="false"
      inputMode="text"
      onKeyDown={(e) => {
        if (e.key === "Tab") { e.preventDefault(); onRestart() }
      }}
      className="opacity-0 absolute top-0 left-0 w-px h-px"
      aria-label="Type here"
    />
  )
})

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ wpm, accuracy, timeLeft, mode, duration, difficulty, onDifficulty, onMode }) {
  return (
    <div className="border-b border-zinc-800/60 bg-[#111111] px-4 sm:px-8 py-3">
      <div className="max-w-5xl mx-auto space-y-3">

        {/* Live stats row */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-xs">WPM:</span>
            <span className="text-white font-bold text-lg tabular-nums">{wpm}</span>
          </div>
          <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-xs">Accuracy:</span>
            <span className="text-red-400 font-bold tabular-nums">{accuracy}%</span>
          </div>
          <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-xs">Time:</span>
            <span className={`font-bold tabular-nums ${timeLeft <= 10 && mode !== "passage" ? "text-red-400" : "text-yellow-400"}`}>
              {mode === "passage" ? `${duration - timeLeft}s` : formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-600 text-[10px] font-mono">Difficulty:</span>
          {["easy", "medium", "hard"].map(d => (
            <button
              key={d}
              onClick={() => onDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize border transition-all ${
                difficulty === d
                  ? "bg-zinc-700 border-zinc-500 text-white"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-800" />
          <span className="text-zinc-600 text-[10px] font-mono">Mode:</span>
          {[
            { key: "timed",   label: "Timed (60s)" },
            { key: "timed30", label: "Timed (30s)" },
            { key: "passage", label: "Passage"     },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onMode(key)}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                mode === key
                  ? "bg-zinc-700 border-zinc-500 text-white"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}

// ─── Result Screen ─────────────────────────────────────────────────────────────
function ResultScreen({ wpm, accuracy, difficulty, mode, duration, bestWPM, restart }) {
  const user                  = useAuth()
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)

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
    try { await signInWithPopup(Auth, Provider) } catch (e) { console.error(e) }
  }

  return (
    <div
      className="bg-[#111111] flex items-center justify-center px-6"
      style={{ height: "100dvh" }}
    >
      <div className="w-full max-w-2xl text-center">

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl">⌨️</span>
          <span className="font-bold text-white text-xl">Typing Speed Test</span>
        </div>

        <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase mb-3">Test complete</p>

        <h1 className="text-7xl font-bold text-white mb-1">
          {wpm}<span className="text-3xl text-zinc-500 font-normal ml-2">WPM</span>
        </h1>

        {wpm >= bestWPM && bestWPM > 0 && (
          <p className="text-yellow-400 text-xs font-mono mb-2">🏆 New personal best!</p>
        )}

        {/* Save status */}
        <div className="h-8 flex items-center justify-center my-2">
          {saving && <p className="text-zinc-500 text-xs font-mono animate-pulse">Saving score...</p>}
          {saved  && <p className="text-emerald-400 text-xs font-mono">✓ Score saved to leaderboard</p>}
          {!user && !saving && !saved && (
            <button onClick={handleSignIn}
              className="text-xs font-mono text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all">
              Sign in to save this score →
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          {[
            { label: "WPM",      value: wpm,            color: "text-white"       },
            { label: "Accuracy", value: `${accuracy}%`, color: "text-red-400"     },
            { label: "Duration", value: `${duration}s`, color: "text-yellow-400"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl py-5">
              <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "Difficulty", value: difficulty },
            { label: "Mode", value: mode === "passage" ? "Passage" : `Timed (${duration}s)` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{label}</span>
              <span className="text-sm font-mono text-zinc-300 capitalize">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={restart}
            className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-medium transition-all">
            Try again ↺
          </button>
          <Link href="/leaderboard"
            className="px-8 py-3 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl font-semibold text-sm transition-all">
            Leaderboard →
          </Link>
        </div>

        <p className="text-zinc-700 text-xs font-mono mt-4">Press Tab to restart</p>
      </div>
    </div>
  )
}

// ─── Main TypingTest ───────────────────────────────────────────────────────────
export default function TypingTest() {
  const [difficulty, setDifficulty] = useState("medium")
  const [mode, setMode]             = useState("timed")
  const [duration, setDuration]     = useState(60)
  const [text, setText]             = useState("")
  const [typed, setTyped]           = useState("")
  const [timeLeft, setTimeLeft]     = useState(60)
  const [started, setStarted]       = useState(false)
  const [finished, setFinished]     = useState(false)
  const [bestWPM, setBestWPM]       = useState(0)

  const intervalRef  = useRef(null)
  const inputRef     = useRef(null)
  const scrollBoxRef = useRef(null)
  const cursorRef    = useRef(null)

  // ── Init ────────────────────────────────────────────────────────────────────
  const init = useCallback((diff = difficulty, mod = mode, dur = duration) => {
    clearInterval(intervalRef.current)
    setText(getRandom(diff))
    setTyped("")
    setTimeLeft(dur)
    setStarted(false)
    setFinished(false)
    if (scrollBoxRef.current) scrollBoxRef.current.scrollTop = 0
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [difficulty, mode, duration])

  useEffect(() => { init() }, [])

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || finished || mode === "passage") return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); setFinished(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [started, finished, mode])

  // ── Passage mode completion ──────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "passage" && typed === text && text.length > 0) {
      setFinished(true); setStarted(false); clearInterval(intervalRef.current)
    }
  }, [typed, text, mode])

  // ── Personal best ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (finished && wpm > bestWPM) setBestWPM(wpm)
  }, [finished])

  // ── Stats ────────────────────────────────────────────────────────────────────
  const elapsed      = duration - timeLeft || 1
  const correctChars = typed.split("").filter((c, i) => c === text[i]).length
  const minutes      = elapsed / 60
  const wpm          = started || finished ? Math.round((correctChars / 5) / minutes) : 0
  const accuracy     = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100

  // ── Scroll cursor into view inside the scroll box ────────────────────────────
  // We scroll the TEXT BOX — never the window.
  // This is why iOS/Android don't shake: the keyboard shrinks 100dvh naturally,
  // and we just scroll our internal div. No window movement at all.
  useEffect(() => {
    const box    = scrollBoxRef.current
    const cursor = cursorRef.current
    if (!box || !cursor) return

    const boxRect    = box.getBoundingClientRect()
    const cursorRect = cursor.getBoundingClientRect()

    // Where cursor sits relative to the top of the scrollable box
    const cursorTopRelativeToBox = cursorRect.top - boxRect.top + box.scrollTop

    // Target: keep cursor at 30% from top of box
    const target = cursorTopRelativeToBox - box.clientHeight * 0.30

    box.scrollTo({ top: Math.max(0, target), behavior: "smooth" })
  }, [typed])

  // ── Input handler ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    if (finished) return
    const val = e.target.value
    if (val.length > text.length) return
    if (!started) setStarted(true)
    setTyped(val)
  }

  const focusInput = (e) => {
    e.stopPropagation()
    inputRef.current?.focus()
  }

  // ── Controls ──────────────────────────────────────────────────────────────────
  const handleDifficulty = (d) => { setDifficulty(d); init(d, mode, duration) }
  const handleMode = (m) => {
    const dur = m === "timed" ? 60 : m === "timed30" ? 30 : 60
    setMode(m); setDuration(dur); init(difficulty, m, dur)
  }
  const restart = () => init()

  // ── Render passage with ref on current character ──────────────────────────────
  const renderPassage = () => {
    if (!text) return null
    const safeTyped = typed ?? ""
    const typedLen  = safeTyped.length

    return text.split("").map((char, i) => {
      const isCursor = i === typedLen
      let cls

      if (i < typedLen) {
        if (safeTyped[i] === char)    cls = "text-green-400"
        else if (char === " ")        cls = "bg-red-500/30 text-red-400 rounded-sm"
        else                          cls = "text-red-400 underline decoration-red-400 underline-offset-4"
      } else if (isCursor) {
        cls = "text-white border-b-2 border-white"
      } else {
        cls = "text-zinc-600"
      }

      return (
        <span key={i} ref={isCursor ? cursorRef : null} className={cls}>
          {char}
        </span>
      )
    })
  }

  // ── Result screen ─────────────────────────────────────────────────────────────
  if (finished) {
    return (
      <ResultScreen
        wpm={wpm}
        accuracy={accuracy}
        bestWPM={bestWPM}
        mode={mode}
        duration={duration}
        difficulty={difficulty}
        restart={restart}
      />
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-[#111111] text-white flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <TypingInput
        ref={inputRef}
        typed={typed}
        onChange={handleChange}
        onRestart={restart}
      />

      {/* Stats — fixed height at top */}
      <div className="flex-none">
        <StatsBar
          wpm={wpm}
          accuracy={accuracy}
          timeLeft={timeLeft}
          mode={mode}
          duration={duration}
          difficulty={difficulty}
          onDifficulty={handleDifficulty}
          onMode={handleMode}
        />
      </div>

      {/* Content area — takes remaining height */}
      <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-8 pt-6 pb-3">
        <div className="max-w-5xl w-full mx-auto flex flex-col flex-1 min-h-0">

          {!started && (
            <p className="text-zinc-700 text-xs font-mono tracking-widest uppercase text-center mb-4 flex-none">
              Tap the text and start typing
            </p>
          )}

          {/*
            THE SCROLL BOX
            ─────────────────────────────────────────────────────
            height: flex-1 with min-h-0 — fills available space
            overflow-y: auto — scrollable inside, window never moves
            100dvh on outer div — shrinks when keyboard opens on iOS/Android
            So when keyboard opens:
              → outer div shrinks → this box shrinks → cursor scrolls inside
              → window never moves → no shaking
          */}
          <div
            ref={scrollBoxRef}
            onClick={focusInput}
            onTouchStart={focusInput}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain cursor-text select-none"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div
              className="text-2xl sm:text-[1.6rem] leading-[2.1] tracking-wide py-2"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            >
              {renderPassage()}
            </div>
            {/* Bottom spacer so last lines scroll above keyboard */}
            <div className="h-40" />
          </div>

          {/* Restart — fixed at bottom, always visible */}
          <div className="flex-none pt-3 flex flex-col items-center gap-2 border-t border-zinc-800/60">
            <button
              onClick={restart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-sm transition-all"
            >
              Restart Test
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
            </button>
            <p className="text-zinc-700 text-[10px] font-mono">
              Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-600 text-[9px]">Tab</kbd> to restart
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}