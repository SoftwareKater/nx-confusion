import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

const SOCKET_ENDPOINT = 'http://localhost:3333';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private connection: SocketIOClient.Socket;

  public connect() {
    this.connection  = io(SOCKET_ENDPOINT, {});
  }

  public createGame() {
    this.connection.emit('create-game');
  }
}
