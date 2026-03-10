import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  advanceSnakeState,
  createInitialSnakeState,
  type GridSize,
  type SnakeDirection,
  type SnakeGameState,
} from '@/lib/snake/engine'

const GRID_SIZE: GridSize = { columns: 14, rows: 14 }
const GAME_TICK_MS = 150

const KEYBOARD_DIRECTION: Record<string, SnakeDirection> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

const BOARD_CELLS = Array.from({
  length: GRID_SIZE.columns * GRID_SIZE.rows,
}).map((_, index) => ({
  x: index % GRID_SIZE.columns,
  y: Math.floor(index / GRID_SIZE.columns),
}))

const CONTROL_BUTTON_CLASSES =
  'flex h-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-semibold text-sm text-white transition hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function SnakeGame() {
  const [state, setState] = useState<SnakeGameState>(() =>
    createInitialSnakeState(GRID_SIZE),
  )
  const queuedDirection = useRef<SnakeDirection | null>(null)

  const enqueueDirection = (direction: SnakeDirection) => {
    queuedDirection.current = direction
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const direction = KEYBOARD_DIRECTION[event.key.toLowerCase()]
      if (!direction) {
        return
      }
      event.preventDefault()
      enqueueDirection(direction)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.status === 'over') {
          return prev
        }

        const requestedDirection = queuedDirection.current ?? prev.direction
        queuedDirection.current = null
        return advanceSnakeState(prev, requestedDirection)
      })
    }, GAME_TICK_MS)

    return () => clearInterval(id)
  }, [])

  const occupancyMap = useMemo(() => {
    const map = new Map<string, 'head' | 'body' | 'food'>()
    state.snake.forEach((segment, index) => {
      const key = `${segment.x},${segment.y}`
      map.set(key, index === 0 ? 'head' : 'body')
    })

    if (state.food) {
      map.set(`${state.food.x},${state.food.y}`, 'food')
    }

    return map
  }, [state.food, state.snake])

  const handleRestart = () => {
    queuedDirection.current = null
    setState(createInitialSnakeState(GRID_SIZE))
  }

  const statusCopy =
    state.status === 'over'
      ? 'Game over — restart to play again'
      : 'Use arrows or buttons to steer'

  return (
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-[420px]">
        <div
          className="grid gap-[2px] rounded-2xl border border-white/10 bg-white/5 p-[2px]"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE.columns}, minmax(0, 1fr))`,
          }}
        >
          {BOARD_CELLS.map((cell) => {
            const key = `${cell.x},${cell.y}`
            const tile = occupancyMap.get(key)

            return (
              <div
                key={key}
                className={clsx(
                  'aspect-square rounded-sm transition-colors',
                  tile === 'head' && 'bg-lime-400',
                  tile === 'body' && 'bg-lime-500/70',
                  tile === 'food' && 'bg-rose-500',
                  !tile && 'bg-white/5',
                )}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/70">
        <span className="text-base font-semibold text-white">Score: {state.score}</span>
        <span className="uppercase tracking-[0.4em] text-[0.65rem]">{statusCopy}</span>
        <button
          type="button"
          onClick={handleRestart}
          className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Restart
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Controls</p>
        <div className="grid grid-cols-3 gap-2">
          <span />
          <button
            type="button"
            className={CONTROL_BUTTON_CLASSES}
            onClick={() => enqueueDirection('up')}
            aria-label="Move up"
          >
            ↑
          </button>
          <span />
          <button
            type="button"
            className={CONTROL_BUTTON_CLASSES}
            onClick={() => enqueueDirection('left')}
            aria-label="Move left"
          >
            ←
          </button>
          <button
            type="button"
            className={CONTROL_BUTTON_CLASSES}
            onClick={() => enqueueDirection('down')}
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            className={CONTROL_BUTTON_CLASSES}
            onClick={() => enqueueDirection('right')}
            aria-label="Move right"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
