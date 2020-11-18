import { Color } from './color.enum';
import { GameScore } from "./game-score.interface";

export interface GameState {
  playerMove: Color;
  score: GameScore;
  loading: boolean;
}
