import { describe, expect, it } from 'vitest'

import {
  advanceSnakeState,
  createInitialSnakeState,
  pickFoodLocation,
  type SnakeDirection,
} from './engine'

describe('snake engine', () => {
  it('advances in the current direction without growing', () => {
    const grid = { columns: 6, rows: 6 }
    const state = createInitialSnakeState(grid, { randomFn: () => 0 })
    const next = advanceSnakeState(state, undefined, () => 0)

    expect(next.snake[0]).toEqual({
      x: state.snake[0].x + 1,
      y: state.snake[0].y,
    })
    expect(next.score).toBe(0)
    expect(next.status).toBe('running')
  })

  it('grows and increments score when eating food', () => {
    const grid = { columns: 6, rows: 6 }
    const baseState = createInitialSnakeState(grid, { randomFn: () => 0 })
    const state = {
      ...baseState,
      food: {
        x: baseState.snake[0].x + 1,
        y: baseState.snake[0].y,
      },
    }

    const next = advanceSnakeState(state, 'right', () => 0)

    expect(next.score).toBe(1)
    expect(next.snake).toHaveLength(state.snake.length + 1)
    expect(next.status).toBe('running')
    expect(next.food).not.toBeNull()
    expect(next.food).not.toEqual(next.snake[0])
  })

  it('marks the game over when colliding with a wall', () => {
    const grid = { columns: 3, rows: 3 }
    const headPosition = { x: 2, y: 1 }
    const state = {
      ...createInitialSnakeState(grid, { randomFn: () => 0 }),
      snake: [headPosition, { x: 1, y: 1 }, { x: 0, y: 1 }],
      direction: 'right' as SnakeDirection,
      food: { x: 0, y: 0 },
    }

    const next = advanceSnakeState(state, 'right', () => 0)

    expect(next.status).toBe('over')
  })

  it('spawns food on empty cells only', () => {
    const grid = { columns: 3, rows: 3 }
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]
    const food = pickFoodLocation(snake, grid, () => 0.5)

    expect(food).not.toBeNull()
    if (food) {
      expect(snake.some((segment) => segment.x === food.x && segment.y === food.y)).toBe(false)
    }
  })
})
