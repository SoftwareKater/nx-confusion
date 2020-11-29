import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import {
  CreateGameResponse,
  GameEvent,
  JoinGameRequest,
  JoinGameResponse,
  PlayerMoveRequest,
  StartGameRequest,
} from '@nx-confusion/types';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  async handleCreateGame(
    @ConnectedSocket() soc: Socket
  ): Promise<WsResponse<CreateGameResponse>> {
    try {
      const result = await this.gameService.createGame(soc);
      console.log(
        `Successfully created new room ${result.roomId} and connected player1 ${result.player1Id}`
      );
      return { event: 'game-created', data: result };
    } catch (err) {
      console.error(err);
      return { event: 'error-creating', data: err.message };
    }
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @MessageBody() req: JoinGameRequest,
    @ConnectedSocket() soc: Socket
  ): Promise<WsResponse<JoinGameResponse>> {
    try {
      const result = await this.gameService.joinGame(req, soc);
      soc.broadcast.to(result.roomId).emit('player-joined', result);
      console.log(
        `Successfully connected player2 ${result.player2Id} to room ${result.roomId}`
      );
      return { event: 'game-joined', data: result };
    } catch (err) {
      console.error(err);
      return { event: 'error-joining', data: err.message };
    }
  }

  @SubscribeMessage('start-game')
  handleStartGame(@MessageBody() req: StartGameRequest): WsResponse<unknown> {
    try {
      const result = this.gameService.startGame(req.roomId);
      this.server.to(req.roomId).emit('new-task', result);
      console.log(`Successfully started a game in room ${result.roomId}`);
    } catch (err) {
      console.error(err);
      return { event: 'error-starting', data: err.message };
    }
  }

  @SubscribeMessage('player-move')
  handlePlayerMove(@MessageBody() req: PlayerMoveRequest): WsResponse<unknown> {
    try {
      const result = this.gameService.playerMove(
        req.roomId,
        req.playerId,
        req.color
      );
      if (result.player1Score >= 10 || result.player2Score >= 10) {
        this.server.to(req.roomId).emit(GameEvent.GameOver, result);
      }
      if (result.match) {
        this.server.to(req.roomId).emit('new-task', result);
        this.server.to(req.roomId).emit('new-score', result);
      } else {
        this.server.to(req.roomId).emit('new-score', result);
      }
    } catch (err) {
      console.error(err);
      return { event: 'error-moving', data: err.message };
    }
  }
}
