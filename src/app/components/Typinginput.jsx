"use client"
import { useEffect, useRef, forwardRef } from "react"

const TypingInput = forwardRef(function TypingInput(
  { typed, onChange, onRestart, passageRef },
  ref
) {
  const internalRef = useRef(null)
  const inputRef = ref || internalRef
  const lastTypedRef = useRef("")

  // Focus on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  // Scroll cursor into view (container-based)
  const scrollCursorIntoView = () => {
    if (!passageRef?.current) return

    const cursor = passageRef.current.querySelector(".typing-cursor")
    if (!cursor) return

    cursor.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  // Scroll when typing
  useEffect(() => {
    if (typed === lastTypedRef.current) return
    lastTypedRef.current = typed

    const t = setTimeout(scrollCursorIntoView, 40)
    return () => clearTimeout(t)
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
      inputMode="text"
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          onRestart()
        }
      }}
      className="opacity-0 absolute top-0 left-0 w-px h-px pointer-events-none"
    />
  )
})

export default TypingInput