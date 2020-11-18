import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { JoinGameRequest } from 'tools/schematics';

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
}
