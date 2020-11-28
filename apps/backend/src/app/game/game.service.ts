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
      game.player1Score = 0;
      game.player2Score = 0;
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
    const colors = [...Object.values(Color)];
    const colorCount = colors.length;
    const label = colors[Math.floor(Math.random() * colorCount)];
    colors.splice(
      colors.findIndex((color) => color === label),
      1
    );
    const background = colors[Math.floor(Math.random() * (colorCount - 1))];
    return {
      label,
      background,
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
      game.player1Score =
        game.player1Score + scoreDelta > 0 ? game.player1Score + scoreDelta : 0;
    } else {
      game.player2Score =
        game.player2Score + scoreDelta > 0 ? game.player2Score + scoreDelta : 0;
    }
  }
}
