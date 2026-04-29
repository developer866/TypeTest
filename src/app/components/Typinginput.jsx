"use client"
import { useEffect, useRef, forwardRef } from "react"

// forwardRef — lets page.jsx pass inputRef so init() can call .focus() after restart
const TypingInput = forwardRef(function TypingInput(
  { typed, onChange, onRestart, passageRef },
  ref
) {
  // If no ref passed from parent, use internal one
  const internalRef = useRef(null)
  const inputRef    = ref || internalRef

  // Focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Auto-scroll cursor into view every time typed changes
  useEffect(() => {
    if (!passageRef?.current) return
    const cursor = passageRef.current.querySelector(".typing-cursor")
    if (!cursor) return
    cursor.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    })
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