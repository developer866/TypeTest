import { formatTime } from "../../../utils/utils"

export default function Stats({
  wpm, accuracy, timeLeft, mode, duration,
  difficulty, onDifficulty, onMode          // ← handlers passed from parent
}) {
  const diffList = ["easy", "medium", "hard"]
  const modeList = [
    { key: "timed",   label: "Timed (60s)" },
    { key: "timed30", label: "Timed (30s)" },
    { key: "passage", label: "Passage"     },
  ]

  return (
    <div className="border-b border-zinc-800/60 px-8 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">

        {/* Live stats */}
        <div className="flex items-center gap-6 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">WPM:</span>
            <span className="text-white font-bold text-xl tabular-nums">{wpm}</span>
          </div>
          <div className="w-px h-5 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Accuracy:</span>
            <span className="text-red-400 font-bold text-lg tabular-nums">{accuracy}%</span>
          </div>
          <div className="w-px h-5 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Time:</span>
            <span className={`font-bold text-lg tabular-nums ${
              timeLeft <= 10 && mode !== "passage" ? "text-red-400" : "text-yellow-400"
            }`}>
              {mode === "passage" ? `${duration - timeLeft}s` : formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-zinc-600 text-xs font-mono">Difficulty:</span>
          <div className="flex gap-1">
            {diffList.map(d => (
              <button
                key={d}
                onClick={() => onDifficulty(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono capitalize border transition-all duration-150 ${
                  difficulty === d
                    ? "bg-zinc-700 border-zinc-500 text-white"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-zinc-800" />
          <span className="text-zinc-600 text-xs font-mono">Mode:</span>
          <div className="flex gap-1">
            {modeList.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onMode(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all duration-150 ${
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
    </div>
  )
}