import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  Color,
  CreateGameResponse,
  GameData,
  GameTask,
  JoinGameRequest,
  JoinGameResponse,
} from 'tools/schematics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameService {
  public inMemoryStorage: GameData[] = [];

  public async createGame(socket: Socket): Promise<CreateGameResponse> {
    const roomId = uuid();
    const player1Id = socket.id;
    return new Promise((resolve, reject) => {
      socket.join(roomId, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(
            `Successfully created new room ${roomId} and connected player1 ${player1Id}`
          );
          this.inMemoryStorage.push({ roomId, player1Id });
          resolve({ roomId, player1Id });
        }
      });
    });
  }

  public async joinGame(
    request: JoinGameRequest,
    socket: Socket
  ): Promise<JoinGameResponse> {
    const roomId = request.roomId;
    const player2Id = socket.id;
    const gameIdx = this.getGameIdxByRoomId(roomId);
    const player1Id = this.inMemoryStorage[gameIdx].player1Id;
    return new Promise((resolve, reject) => {
      socket.join(roomId, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(
            `Successfully connected player2 ${player2Id} to existing room ${roomId}`
          );
          this.inMemoryStorage[gameIdx].player2Id = player2Id;
          resolve({
            roomId,
            player1Id,
            player2Id,
          });
        }
      });
    });
  }

  public startGame(roomId: string): GameData {
    const game = this.inMemoryStorage[this.getGameIdxByRoomId(roomId)];
    const ready = !!game.player1Id && !!game.player2Id;
    if (ready) {
      game.task = this.createTask();
      return game;
    } else {
      throw new Error('NotEnoughPlayers');
    }
  }

  public playerMove(
    roomId: string,
    playerId: string,
    playerColor: Color
  ): GameData {
    const game = this.inMemoryStorage[this.getGameIdxByRoomId(roomId)];
    game.match = false;
    if (this.checkMatch(game, playerColor)) {
      this.updateScore(game, playerId, 1);
      game.match = true;
      game.task = this.createTask();
    } else {
      this.updateScore(game, playerId, -2);
    }
    return game;
  }

  private checkMatch(game: GameData, playerColor: Color): boolean {
    if (game.task.label === playerColor) {
      return true;
    }
    return false;
  }

  private createTask(): GameTask {
    const colorCount = Object.keys(Color).length;
    return {
      label: Color[Math.random() * colorCount],
      background: Color[Math.random() * colorCount],
    };
  }

  private getGameIdxByRoomId(roomId: string): number {
    const gameIdx = this.inMemoryStorage.findIndex((g) => g.roomId === roomId);
    if (gameIdx <= 0) {
      throw new Error('RoomNotFound');
    }
    return gameIdx;
  }

  private updateScore(
    game: GameData,
    playerId: string,
    scoreDelta: number
  ): void {
    if (game.player1Id === playerId) {
      game.player1Score += scoreDelta;
    } else {
      game.player2Score += scoreDelta;
    }
  }
}
