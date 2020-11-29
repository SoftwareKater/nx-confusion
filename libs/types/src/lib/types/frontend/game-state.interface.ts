import { GameTask, Color, GameScore } from '../..';

export interface GameState {
  loading: boolean;
  playerMove: Color;
  score: GameScore;
  task: GameTask;
  timeCounter: number;
}
