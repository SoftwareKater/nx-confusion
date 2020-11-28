import { GameTask, Color, GameScore } from '../..';

export interface GameState {
  task: GameTask;
  playerMove: Color;
  score: GameScore;
  loading: boolean;
}
