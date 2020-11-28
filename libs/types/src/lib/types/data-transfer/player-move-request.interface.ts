import { Color } from './color.enum';

export interface PlayerMoveRequest {
  roomId: string;
  playerId: string;
  color: Color;
}
