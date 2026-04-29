"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import Result from './components/Result'
import Stats from './components/Stats'
import TypingInput from './components/TypingInput'
import { getRandom, renderText } from "./utils/utils"

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

  const intervalRef = useRef(null)
  const passageRef  = useRef(null)
  const inputRef    = useRef(null)

  // ── Init ──────────────────────────────────────────────────────────────────
  const init = useCallback((diff = difficulty, mod = mode, dur = duration) => {
    clearInterval(intervalRef.current)
    setText(getRandom(diff))
    setTyped("")
    setTimeLeft(dur)
    setStarted(false)
    setFinished(false)
    // Scroll back to top then focus
    window.scrollTo({ top: 0, behavior: "smooth" })
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [difficulty, mode, duration])

  useEffect(() => { init() }, [])

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || finished || mode === "passage") return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [started, finished, mode])

  // ── Passage mode completion ───────────────────────────────────────────────
  useEffect(() => {
    if (mode === "passage" && typed === text && text.length > 0) {
      setFinished(true)
      setStarted(false)
      clearInterval(intervalRef.current)
    }
  }, [typed, text, mode])

  // ── Personal best ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (finished && wpm > bestWPM) setBestWPM(wpm)
  }, [finished])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const elapsed      = duration - timeLeft || 1
  const correctChars = typed.split("").filter((c, i) => c === text[i]).length
  const minutes      = elapsed / 60
  const wpm          = started || finished ? Math.round((correctChars / 5) / minutes) : 0
  const accuracy     = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100

  // ── Input handler ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    if (finished) return
    const val = e.target.value
    if (val.length > text.length) return
    if (!started) setStarted(true)
    setTyped(val)
  }

  // ── Focus helper — only on passage tap, not whole page ───────────────────
  const focusInput = (e) => {
    e.stopPropagation()
    inputRef.current?.focus()
  }

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleDifficulty = (d) => { setDifficulty(d); init(d, mode, duration) }
  const handleMode = (m) => {
    const dur = m === "timed" ? 60 : m === "timed30" ? 30 : 60
    setMode(m); setDuration(dur); init(difficulty, m, dur)
  }
  const restart = () => init()

  // ── Results screen ────────────────────────────────────────────────────────
  if (finished) {
    return (
      <Result
        wpm={wpm}
        accuracy={accuracy}
        bestWPM={bestWPM}
        mode={mode}
        duration={duration}
        timeLeft={timeLeft}
        difficulty={difficulty}
        restart={restart}
      />
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">

      <TypingInput
        ref={inputRef}
        typed={typed}
        onChange={handleChange}
        onRestart={restart}
        passageRef={passageRef}
      />

      <Stats
        wpm={wpm}
        accuracy={accuracy}
        timeLeft={timeLeft}
        mode={mode}
        duration={duration}
        difficulty={difficulty}
        onDifficulty={handleDifficulty}
        onMode={handleMode}
      />

      {/* pb-96 gives enough space below text so it's never hidden by keyboard */}
      <div className="flex-1 px-4 sm:px-8 py-8 pb-96 sm:py-12 sm:pb-12">
        <div className="max-w-5xl mx-auto">

          {!started && (
            <p className="text-zinc-700 text-xs font-mono tracking-widest uppercase text-center mb-6">
              Tap the text and start typing
            </p>
          )}

          {/* Passage — tap/click to focus input */}
          <div
            ref={passageRef}
            onClick={focusInput}
            onTouchStart={focusInput}
            className="text-2xl sm:text-[1.6rem] leading-[1.9] tracking-wide select-none cursor-text"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
          >
            {renderText(text, typed)}
          </div>

          <div className="mt-10 sm:mt-12 border-t border-zinc-800/60" />

          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={restart}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-sm transition-all duration-200"
            >
              Restart Test
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>

          <p className="text-center text-zinc-700 text-xs font-mono mt-3">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px]">Tab</kbd> to restart
          </p>

        </div>
      </div>
    </div>
  )
}