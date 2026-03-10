import { SnakeGame } from '@/components/games/SnakeGame'

export function SnakeSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Developer break</p>
          <h3 className="text-3xl font-semibold">Classic Snake</h3>
          <p className="text-base text-white/80">
            A quick, deterministic Snake loop keeps the focus on rhythm and timing. Use the
            keyboard or the on-screen pad to guide the snake, eat food, and grow without
            crashing into the walls or your own tail.
          </p>
        </div>
        <SnakeGame />
        <p className="text-sm text-white/60">
          Score increases with each food bit, the board resets on restart, and walls are lethal.
          Perfect for a minute of mindless fun between demos.
        </p>
      </div>
    </section>
  )
}
