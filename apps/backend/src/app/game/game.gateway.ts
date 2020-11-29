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
  GameData,
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

  @SubscribeMessage(GameEvent.CreateGame)
  async handleCreateGame(
    @ConnectedSocket() soc: Socket
  ): Promise<WsResponse<CreateGameResponse>> {
    try {
      const result = await this.gameService.createGame(soc);
      console.log(
        `Successfully created new room ${result.roomId} and connected player1 ${result.player1Id}`
      );
      return { event: GameEvent.GameCreated, data: result };
    } catch (err) {
      console.error(err);
      return { event: GameEvent.ErrorCreating, data: err.message };
    }
  }

  @SubscribeMessage(GameEvent.JoinGame)
  async handleJoinGame(
    @MessageBody() req: JoinGameRequest,
    @ConnectedSocket() soc: Socket
  ): Promise<WsResponse<JoinGameResponse>> {
    try {
      const result = await this.gameService.joinGame(req, soc);
      soc.broadcast.to(result.roomId).emit(GameEvent.PlayerJoined, result);
      console.log(
        `Successfully connected player2 ${result.player2Id} to room ${result.roomId}`
      );
      return { event: GameEvent.GameJoined, data: result };
    } catch (err) {
      console.error(err);
      return { event: GameEvent.ErrorJoining, data: err.message };
    }
  }

  @SubscribeMessage(GameEvent.StartGame)
  handleStartGame(@MessageBody() req: StartGameRequest): WsResponse<unknown> {
    try {
      const result = this.gameService.startGame(this.server, req.roomId);
      this.server.to(req.roomId).emit(GameEvent.NewTask, result);
      console.log(`Successfully started a game in room ${result.roomId}`);
    } catch (err) {
      console.error(err);
      return { event: 'error-starting', data: err.message };
    }
  }

  @SubscribeMessage(GameEvent.PlyerMove)
  handlePlayerMove(
    @MessageBody() req: PlayerMoveRequest
  ): WsResponse<GameData> {
    try {
      const result = this.gameService.playerMove(
        req.roomId,
        req.playerId,
        req.color
      );
      if (result.match) {
        this.server.to(req.roomId).emit(GameEvent.NewScore, result);
        return { event: GameEvent.NewTask, data: result };
      } else {
        this.server.to(req.roomId).emit(GameEvent.NewScore, result);
      }
    } catch (err) {
      console.error(err);
      return { event: 'error-moving', data: err.message };
    }
  }
}
