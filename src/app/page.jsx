"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import Result from './components/Result'
import Stats from './components/Stats'
import { getRandom, renderText } from "../../utils/utils"  // passages no longer needed here

export default function TypingTest() {
  const [difficulty, setDifficulty] = useState("medium")
  const [mode, setMode] = useState("timed")
  const [duration, setDuration] = useState(60)
  const [text, setText] = useState("")
  const [typed, setTyped] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [bestWPM, setBestWPM] = useState(0)
  const intervalRef = useRef(null)
  const inputRef = useRef(null)

  const init = useCallback((diff = difficulty, mod = mode, dur = duration) => {
    clearInterval(intervalRef.current)
    setText(getRandom(diff))        // ✅ no passages argument needed anymore
    setTyped("")
    setTimeLeft(dur)
    setStarted(false)
    setFinished(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [difficulty, mode, duration])

  useEffect(() => { init() }, [])

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

  useEffect(() => {
    if (mode === "passage" && typed === text && text.length > 0) {
      setFinished(true)
      setStarted(false)
      clearInterval(intervalRef.current)
    }
  }, [typed, text, mode])

  useEffect(() => {
    if (finished && wpm > bestWPM) setBestWPM(wpm)
  }, [finished])

  const elapsed = duration - timeLeft || 1
  const correctChars = typed.split("").filter((c, i) => c === text[i]).length
  const minutes = elapsed / 60
  const wpm = started || finished ? Math.round((correctChars / 5) / minutes) : 0
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100

  const handleChange = (e) => {
    if (finished) return
    const val = e.target.value
    if (val.length > text.length) return
    if (!started) setStarted(true)
    setTyped(val)
  }

  const handleDifficulty = (d) => { setDifficulty(d); init(d, mode, duration) }
  const handleMode = (m) => {
    const dur = m === "timed" ? 60 : m === "timed30" ? 30 : 60
    setMode(m); setDuration(dur); init(difficulty, m, dur)
  }
  const restart = () => init()

  if (finished) {
    return (
    <Result
      wpm={wpm}
      accuracy={accuracy}
      bestWPM={bestWPM}
      mode={mode}
      duration={duration}
      timeLeft={timeLeft}
      restart={restart}
      difficulty={difficulty}
       />)
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col"
      onClick={() => inputRef.current?.focus()}>

      {/* Navbar */}
      <div className="border-b border-zinc-800/60 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          {bestWPM > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">🏆</span>
              <span className="text-zinc-400">Personal best:</span>
              <span className="text-white font-bold">{bestWPM} WPM</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar — handlers passed down */}
      <Stats wpm={wpm} accuracy={accuracy} timeLeft={timeLeft}
        mode={mode} duration={duration} difficulty={difficulty}
        onDifficulty={handleDifficulty} onMode={handleMode} />

      {/* Typing area */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {!started && (
            <p className="text-zinc-700 text-xs font-mono tracking-widest uppercase text-center mb-8">
              Click anywhere and start typing
            </p>
          )}
          <input ref={inputRef} value={typed} onChange={handleChange} autoFocus
            onKeyDown={(e) => { if (e.key === "Tab") { e.preventDefault(); restart() } }}
            className="opacity-0 absolute top-0 left-0 w-0 h-0" />

          <div className="text-[1.6rem] leading-[1.9] tracking-wide select-none cursor-default"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
            {renderText(text, typed)}  {/* ✅ pass typed as second argument */}
          </div>

          <div className="mt-12 border-t border-zinc-800/60" />
          <div className="mt-8 flex justify-center">
            <button onClick={restart}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white font-medium text-sm transition-all">
              Restart Test
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
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