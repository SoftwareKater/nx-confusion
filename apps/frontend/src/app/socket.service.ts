import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
} from 'tools/schematics';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameCreatedSnackbarComponent } from './components/snackbars/game-created/game-created.snackbar.component';

const SOCKET_ENDPOINT = 'http://localhost:3333';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private connection: SocketIOClient.Socket;

  constructor(private snackBar: MatSnackBar) {}

  public connect(): void {
    this.connection = io(SOCKET_ENDPOINT, {});
    this.connection.on('game-created', (res: CreateGameResponse) => {
      this.snackBar.openFromComponent(GameCreatedSnackbarComponent, {
        data: {
          roomId: res.roomId,
        },
      });
    });
    this.connection.on('error-creating', (errMsg: string) => {
      console.error('Error while creating a game: ', errMsg);
    });
    this.connection.on('game-joined', (res: JoinGameResponse) => {
      this.snackBar.open(`Joined player 1 ${res.player1Id}`, '', {
        duration: 2500,
      });
    });
    this.connection.on('player-joined', (res: JoinGameResponse) => {
      this.snackBar.open(`Player 2 ${res.player2Id} joined your game.`, '', {
        duration: 2500,
      });
    });
    this.connection.on('error-joining', (errMsg: string) => {
      console.log('Error while joining a game: ', errMsg);
    });
  }

  public createGame(): void {
    this.connection.emit('create-game');
  }

  public joinGame(roomId: string): void {
    const req: JoinGameRequest = { roomId };
    this.connection.emit('join-game', req);
  }
}
