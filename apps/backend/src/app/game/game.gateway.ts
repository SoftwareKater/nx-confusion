import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
  PlayerMoveRequest,
  StartGameRequest,
} from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(
    @ConnectedSocket() soc: Socket
  ): WsResponse<CreateGameResponse> {
    try {
      const result = this.gameService.createGame(soc);
      return { event: 'game-created', data: result };
    } catch (err) {
      console.error(err);
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
      soc.broadcast.to(result.roomId).emit('player-joined', result);
      return { event: 'game-joined', data: result };
    } catch (err) {
      console.error(err);
      return { event: 'error-joining', data: err.message };
    }
  }

  @SubscribeMessage('start-game')
  handleStartGame(
    @MessageBody() req: StartGameRequest
  ): WsResponse<unknown> {
    try {
      const result = this.gameService.startGame(req.roomId);
      this.server.to(req.roomId).emit('new-task', result);
    } catch (err) {
      console.error(err);
      return { event: 'error-starting', data: err.message };
    }
  }

  @SubscribeMessage('player-move')
  handlePlayerMove(
    @MessageBody() req: PlayerMoveRequest,
  ): WsResponse<unknown> {
    try {
      const result = this.gameService.playerMove(
        req.roomId,
        req.playerId,
        req.color
      );
      if (result.match) {
        this.server.to(req.roomId).emit('new-task', result);
        this.server.to(req.roomId).emit('new-score', result)
      } else {
        this.server.to(req.roomId).emit('new-score', result)
      }
    } catch (err) {
      console.error(err);
      return { event: 'error-moving', data: err.message };
    }
  }
}
