import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { CreateGameResponse } from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(@ConnectedSocket() soc: Socket): CreateGameResponse {
    const result = this.gameService.createGame(soc);
    return result;
  }
}
