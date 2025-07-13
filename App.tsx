import React, { useState, useEffect, useCallback } from 'react';
import { type Coordinate, Direction } from './types';
import { BOARD_SIZE, INITIAL_SPEED, LEVEL_SPEED_INCREMENT, POINTS_PER_LEVEL, INITIAL_SNAKE_POSITION, INITIAL_FOOD_POSITION } from './constants';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './components/icons';

const generateFood = (snakeBody: Coordinate[]): Coordinate => {
  while (true) {
    const foodPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (!snakeBody.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y)) {
      return foodPosition;
    }
  }
};

function App() {
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinate>(generateFood(INITIAL_SNAKE_POSITION));
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(generateFood(INITIAL_SNAKE_POSITION));
    setDirection(Direction.RIGHT);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPaused(true);
    setScore(0);
    setLevel(1);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (isPaused && e.key.startsWith('Arrow')) {
        setIsPaused(false);
    }

    setDirection(prevDirection => {
      switch (e.key) {
        case 'ArrowUp':
          if (prevDirection !== Direction.DOWN) return Direction.UP;
          break;
        case 'ArrowDown':
          if (prevDirection !== Direction.UP) return Direction.DOWN;
          break;
        case 'ArrowLeft':
          if (prevDirection !== Direction.RIGHT) return Direction.LEFT;
          break;
        case 'ArrowRight':
          if (prevDirection !== Direction.LEFT) return Direction.RIGHT;
          break;
      }
      return prevDirection;
    });
  }, [isPaused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isGameOver || isPaused) {
      return;
    }

    const gameInterval = setInterval(() => {
      const snakeHead = snake[0];
      const newHead = { ...snakeHead };

      switch (direction) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Wall and self collision check
      if (
        newHead.x < 0 || newHead.x >= BOARD_SIZE ||
        newHead.y < 0 || newHead.y >= BOARD_SIZE ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        // Snake grows, so we don't pop the tail
        setFood(generateFood(newSnake));

        const newScore = score + 1;
        setScore(newScore);

        const newLevel = Math.floor(newScore / POINTS_PER_LEVEL) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          const newSpeed = Math.max(50, INITIAL_SPEED - ((newLevel - 1) * LEVEL_SPEED_INCREMENT));
          setSpeed(newSpeed);
        }
      } else {
        // Snake moves, so we pop the tail
        newSnake.pop();
      }

      setSnake(newSnake);

    }, speed);

    return () => clearInterval(gameInterval);
  }, [snake, direction, isGameOver, isPaused, speed, food, score, level]);

  const handleDirectionChange = (newDirection: Direction) => {
    if (isPaused) setIsPaused(false);
    setDirection(prevDirection => {
        if (newDirection === Direction.UP && prevDirection === Direction.DOWN) return prevDirection;
        if (newDirection === Direction.DOWN && prevDirection === Direction.UP) return prevDirection;
        if (newDirection === Direction.LEFT && prevDirection === Direction.RIGHT) return prevDirection;
        if (newDirection === Direction.RIGHT && prevDirection === Direction.LEFT) return prevDirection;
        return newDirection;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 text-slate-200 font-mono p-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <header className="flex justify-between items-center mb-4 p-2 border-2 border-slate-600 rounded-lg">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-lime-400">SNAKE</h1>
          <div className="flex items-center gap-4">
            <div className="text-base sm:text-lg md:text-xl">LEVEL: <span className="font-bold text-lime-400">{level}</span></div>
            <div className="text-base sm:text-lg md:text-xl">SCORE: <span className="font-bold text-lime-400">{score}</span></div>
          </div>
        </header>

        <main className="relative aspect-square w-full bg-slate-900 border-4 border-slate-600 rounded-lg overflow-hidden">
          {(isGameOver || isPaused) && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-10">
                {isGameOver ? (
                    <>
                        <h2 className="text-4xl font-bold text-red-500">GAME OVER</h2>
                        <p className="text-xl mt-2">Your score: {score}</p>
                        <button 
                            onClick={resetGame}
                            className="mt-6 px-6 py-2 bg-lime-500 text-slate-900 font-bold rounded-lg hover:bg-lime-400 transition-colors"
                        >
                            Play Again
                        </button>
                    </>
                ) : (
                    <>
                         <h2 className="text-4xl font-bold text-lime-400">Ready?</h2>
                         <p className="text-xl mt-2 text-center px-4">Use arrow keys or buttons to move.</p>
                        <button 
                            onClick={() => setIsPaused(false)}
                            className="mt-6 px-6 py-2 bg-lime-500 text-slate-900 font-bold rounded-lg hover:bg-lime-400 transition-colors animate-pulse"
                        >
                            Start Game
                        </button>
                    </>
                )}
            </div>
          )}
          <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`w-full h-full ${index === 0 ? 'bg-lime-300' : 'bg-lime-500'} rounded-sm`}
                style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}
              />
            ))}
            <div
              className="w-full h-full bg-red-500 rounded-full"
              style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}
            />
          </div>
        </main>

        <footer className="mt-6 flex justify-center">
            <div className="grid grid-cols-3 grid-rows-2 gap-2 w-48">
                <div className="col-start-2 row-start-1">
                    <button onClick={() => handleDirectionChange(Direction.UP)} className="p-3 w-full bg-slate-700 rounded-lg hover:bg-slate-600 flex justify-center"><ArrowUpIcon /></button>
                </div>
                <div className="col-start-1 row-start-2">
                    <button onClick={() => handleDirectionChange(Direction.LEFT)} className="p-3 w-full bg-slate-700 rounded-lg hover:bg-slate-600 flex justify-center"><ArrowLeftIcon /></button>
                </div>
                <div className="col-start-2 row-start-2">
                    <button onClick={() => handleDirectionChange(Direction.DOWN)} className="p-3 w-full bg-slate-700 rounded-lg hover:bg-slate-600 flex justify-center"><ArrowDownIcon /></button>
                </div>
                <div className="col-start-3 row-start-2">
                    <button onClick={() => handleDirectionChange(Direction.RIGHT)} className="p-3 w-full bg-slate-700 rounded-lg hover:bg-slate-600 flex justify-center"><ArrowRightIcon /></button>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
