import { GameTask } from './game-task.interface';

export interface GameData {
  match?: boolean;
  roomId?: string;
  player1Id?: string;
  player1Score?: number;
  player2Id?: string;
  player2Score?: number;
  task?: GameTask;
}
