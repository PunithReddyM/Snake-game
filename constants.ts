import { type Coordinate } from './types';

export const BOARD_SIZE = 20;
export const INITIAL_SPEED = 200;
export const POINTS_PER_LEVEL = 5;
export const LEVEL_SPEED_INCREMENT = 20; // Speed increases by this amount (ms) per level

export const INITIAL_SNAKE_POSITION: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_FOOD_POSITION: Coordinate = { x: 15, y: 15 };