export type GridSize = {
  columns: number
  rows: number
}

export type SnakeDirection = 'up' | 'down' | 'left' | 'right'
export type GameStatus = 'running' | 'over'

export type Point = {
  x: number
  y: number
}

export interface SnakeGameState {
  snake: Point[]
  direction: SnakeDirection
  food: Point | null
  score: number
  status: GameStatus
  grid: GridSize
}

export type RandomFn = () => number

const directionOffsets: Record<SnakeDirection, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const opposites: Record<SnakeDirection, SnakeDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const serializePoint = (point: Point) => `${point.x},${point.y}`

export function createInitialSnakeState(
  grid: GridSize,
  options?: { initialLength?: number; randomFn?: RandomFn },
): SnakeGameState {
  const randomFn = options?.randomFn ?? Math.random
  const initialLength = Math.max(3, options?.initialLength ?? 3)
  const centerX = Math.floor(grid.columns / 2)
  const centerY = Math.floor(grid.rows / 2)
  const snake: Point[] = Array.from({ length: initialLength }, (_, index) => ({
    x: centerX - index,
    y: centerY,
  }))

  const food = pickFoodLocation(snake, grid, randomFn)

  if (!food) {
    throw new Error('Grid is too small to place food')
  }

  return {
    snake,
    direction: 'right',
    food,
    score: 0,
    status: 'running',
    grid,
  }
}

export function pickFoodLocation(
  snake: Point[],
  grid: GridSize,
  randomFn: RandomFn = Math.random,
): Point | null {
  const occupied = new Set(snake.map(serializePoint))
  const available: Point[] = []

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.columns; x += 1) {
      const value = serializePoint({ x, y })
      if (!occupied.has(value)) {
        available.push({ x, y })
      }
    }
  }

  if (!available.length) {
    return null
  }

  const index = Math.floor(randomFn() * available.length)
  return available[index]
}

export function advanceSnakeState(
  state: SnakeGameState,
  requestedDirection?: SnakeDirection,
  randomFn: RandomFn = Math.random,
): SnakeGameState {
  if (state.status === 'over') {
    return state
  }

  const desiredDirection = requestedDirection ?? state.direction
  const nextDirection = chooseDirection(state.direction, desiredDirection)
  const offset = directionOffsets[nextDirection]
  const head = state.snake[0]
  const nextHead = { x: head.x + offset.x, y: head.y + offset.y }

  const collidesWithWall =
    nextHead.x < 0 ||
    nextHead.x >= state.grid.columns ||
    nextHead.y < 0 ||
    nextHead.y >= state.grid.rows

  const willGrow =
    state.food !== null &&
    nextHead.x === state.food.x &&
    nextHead.y === state.food.y

  const bodySet = new Set(state.snake.map(serializePoint))
  const tail = state.snake[state.snake.length - 1]
  const isTailCollision = tail && nextHead.x === tail.x && nextHead.y === tail.y
  const hitsSelf =
    bodySet.has(serializePoint(nextHead)) &&
    !(willGrow === false && isTailCollision)

  if (collidesWithWall || hitsSelf) {
    return {
      ...state,
      snake: [nextHead, ...state.snake],
      direction: nextDirection,
      status: 'over',
    }
  }

  const nextSnake = [nextHead, ...state.snake]
  if (!willGrow) {
    nextSnake.pop()
  }

  let nextFood = state.food
  let nextScore = state.score

  if (willGrow) {
    nextScore += 1
    const newFood = pickFoodLocation(nextSnake, state.grid, randomFn)
    if (!newFood) {
      return {
        ...state,
        snake: nextSnake,
        direction: nextDirection,
        food: null,
        score: nextScore,
        status: 'over',
      }
    }
    nextFood = newFood
  }

  return {
    ...state,
    snake: nextSnake,
    direction: nextDirection,
    food: nextFood,
    score: nextScore,
  }
}

function chooseDirection(
  current: SnakeDirection,
  requested: SnakeDirection,
): SnakeDirection {
  if (opposites[current] === requested) {
    return current
  }

  return requested
}
