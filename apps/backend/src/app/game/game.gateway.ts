import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
} from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(
    @ConnectedSocket() soc: Socket
  ): WsResponse<CreateGameResponse> {
    try {
      const result = this.gameService.createGame(soc);
      return { event: 'game-created', data: result };
    } catch (err) {
      return { event: 'error-creating', data: err.message };
    }
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() req: JoinGameRequest,
    @ConnectedSocket() soc: Socket
  ): WsResponse<JoinGameResponse> {
    try {
      const result = this.gameService.joinGame(req, soc);
      return { event: 'game-joined', data: result };
    } catch (err) {
      return { event: 'error-joining', data: err.message };
    }
  }
}
