"use client"
import { useEffect, useRef, forwardRef } from "react"

const TypingInput = forwardRef(function TypingInput(
  { typed, onChange, onRestart, passageRef },
  ref
) {
  const internalRef = useRef(null)
  const inputRef    = ref || internalRef

  // Focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // ── Scroll cursor into view accounting for iOS keyboard ──────────────────
  useEffect(() => {
    if (!passageRef?.current) return

    const cursor = passageRef.current.querySelector(".typing-cursor")
    if (!cursor) return

    // Get cursor position relative to viewport
    const cursorRect  = cursor.getBoundingClientRect()
    const viewportH   = window.innerHeight

    // On mobile, keyboard takes ~40% of screen height
    // We treat anything below 55% of viewport as "covered by keyboard"
    const safeBottom  = viewportH * 0.55

    if (cursorRect.top > safeBottom || cursorRect.bottom > safeBottom) {
      // Scroll so cursor sits at 35% from top — well above keyboard
      const targetY = window.scrollY + cursorRect.top - viewportH * 0.35
      window.scrollTo({ top: targetY, behavior: "smooth" })
    }

    // Also handle if cursor has scrolled above viewport
    if (cursorRect.top < 80) {
      const targetY = window.scrollY + cursorRect.top - 100
      window.scrollTo({ top: targetY, behavior: "smooth" })
    }
  }, [typed])

  return (
    <input
      ref={inputRef}
      value={typed}
      onChange={onChange}
      autoFocus
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck="false"
      data-gramm="false"
      onKeyDown={(e) => {
        if (e.key === "Tab") { e.preventDefault(); onRestart() }
      }}
      className="opacity-0 absolute top-0 left-0 w-px h-px"
      aria-label="Type here"
    />
  )
})

export default TypingInput