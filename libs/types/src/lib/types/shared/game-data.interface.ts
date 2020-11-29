import { PlayerData } from './player-data.interface';

export interface GameData {
  match?: boolean;
  roomId?: string;
  timeCounter?: number;
  player1Id?: string;
  player2Id?: string;
  playerData?: { [playerId: string]: PlayerData };
}
