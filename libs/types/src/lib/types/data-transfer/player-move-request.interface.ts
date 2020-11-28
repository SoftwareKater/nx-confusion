import { Color } from '../..';

export interface PlayerMoveRequest {
  roomId: string;
  playerId: string;
  color: Color;
}
