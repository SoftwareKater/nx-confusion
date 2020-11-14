import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { CreateGameResponse, JoinGameRequest, JoinGameResponse } from 'tools/schematics';

const SOCKET_ENDPOINT = 'http://localhost:3333';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private connection: SocketIOClient.Socket;

  public connect(): void {
    this.connection = io(SOCKET_ENDPOINT, {});
    this.connection.on('game-created', (res: CreateGameResponse) => {
      console.log('ACK game-created ', res);
    });
    this.connection.on('error-creating', (errMsg: string) => {
      console.error('Error while creating a game: ', errMsg)
    })
    this.connection.on('game-joined', (res: JoinGameResponse) => {
      console.log('ACK game-joined ', res);
    })
    this.connection.on('error-joining', (errMsg: string) => {
      console.log('Error while joining a game: ', errMsg);
    })

  }

  public createGame(): void {
    this.connection.emit('create-game');
  }

  public joinGame(roomId: string): void {
    const req: JoinGameRequest = { roomId };
    this.connection.emit('join-game', req);
  }
}
