import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  CreateGameResponse,
  GameData,
  JoinGameRequest,
  JoinGameResponse,
} from 'tools/schematics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameService {
  public inMemoryStorage: GameData[] = [];

  public createGame(socket: Socket): CreateGameResponse {
    const roomId = uuid();
    const player1Id = socket.id;
    socket.join(roomId, (err) => {
      if (err) {
        throw err;
      } else {
        console.log(
          `Successfully created new room ${roomId} and connected player1 ${player1Id}`
        );
      }
    });
    this.inMemoryStorage.push({ roomId, player1Id });
    return {
      roomId,
      player1Id,
    };
  }

  public joinGame(request: JoinGameRequest, socket: Socket): JoinGameResponse {
    const roomId = request.roomId;
    const player2Id = socket.id;
    const gameIdx = this.inMemoryStorage.findIndex((g) => g.roomId === roomId);
    if (gameIdx <= 0) {
      throw new Error('RoomNotFoundError');
    }
    const player1Id = this.inMemoryStorage[gameIdx].player1Id;
    socket.join(roomId, (err) => {
      if (err) {
        throw err;
      } else {
        this.inMemoryStorage[gameIdx].player2Id = player2Id;
        console.log(
          `Successfully connected player2 ${player2Id} to existing room ${roomId}`
        );
      }
    });
    return {
      roomId,
      player1Id,
      player2Id,
    };
  }
}
