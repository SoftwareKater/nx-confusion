import { Color } from './color.enum';
import { GameScore } from './game-score.interface';
import { GameTask } from './game-task.interface';

export interface GameState {
  task: GameTask;
  playerMove: Color;
  score: GameScore;
  loading: boolean;
}
