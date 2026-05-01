"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import TypingInput   from "./components/Typinginput"
import StatsBar      from "./components/Stats"
import ResultScreen  from "./components/Result"
import { getRandom } from "./utils/utils"

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
      setFinished(true)
      setStarted(false)
      clearInterval(intervalRef.current)
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
  useEffect(() => {
    const box    = scrollBoxRef.current
    const cursor = cursorRef.current
    if (!box || !cursor) return

    const boxRect    = box.getBoundingClientRect()
    const cursorRect = cursor.getBoundingClientRect()

    const cursorTopRelativeToBox = cursorRect.top - boxRect.top + box.scrollTop
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

  // ── Render passage ────────────────────────────────────────────────────────────
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

      <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-8 pt-6 pb-3">
        <div className="max-w-5xl w-full mx-auto flex flex-col flex-1 min-h-0">

          {!started && (
            <p className="text-zinc-700 text-xs font-mono tracking-widest uppercase text-center mb-4 flex-none">
              Tap the text and start typing
            </p>
          )}

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
            <div className="h-40" />
          </div>

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