import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Client, Server, Socket } from 'socket.io';
import {
  CreateGameRequest,
  CreateGameResponse,
} from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(
    @MessageBody() req: CreateGameRequest,
    @ConnectedSocket() soc: Socket
  ): CreateGameResponse {
    const result = this.gameService.createGame(soc);
    return result;
  }
}
