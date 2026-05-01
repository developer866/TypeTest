

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

export const getRandom = (diff) => {
  const pool = passages[diff] ?? passages.medium
  return pool[Math.floor(Math.random() * pool.length)]
}

export const formatTime = (s) => {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, "0")}`
}