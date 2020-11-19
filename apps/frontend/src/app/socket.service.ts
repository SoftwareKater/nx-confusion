import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Color, JoinGameRequest, PlayerMoveRequest, StartGameRequest } from 'tools/schematics';

const SOCKET_ENDPOINT = 'http://localhost:3333';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private connection: SocketIOClient.Socket;

  constructor() {}

  public connect(): void {
    this.connection = io(SOCKET_ENDPOINT, {});
  }

  public createHandler(event: string, callback: (res: any) => void): void {
    this.connection.on(event, callback);
  }

  public createGame(): void {
    this.connection.emit('create-game');
  }

  public joinGame(roomId: string): void {
    const req: JoinGameRequest = { roomId };
    this.connection.emit('join-game', req);
  }

  public startGame(roomId: string): void {
    const req: StartGameRequest = { roomId };
    this.connection.emit('start-game', req);
  }

  public playerMove(color: Color, roomId: string, playerId: string): void {
    const req: PlayerMoveRequest = { color, roomId, playerId };
    this.connection.emit('player-move', req);
  }
}
