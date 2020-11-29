import {
  Color,
  CreateGameResponse,
  GameData,
  GameEvent,
  GameTask,
  JoinGameRequest,
  JoinGameResponse,
  PlayerData,
} from '@nx-confusion/types';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
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
    const game = this.inMemoryStorage[gameIdx];
    const player1Id = game.player1Id;
    const roomIsFull = !!game.player1Id && !!game.player2Id;
    if (roomIsFull) {
      throw new Error('RoomIsFull');
    }
    return new Promise((resolve, reject) => {
      socket.join(roomId, (err) => {
        if (err) {
          reject(err);
        } else {
          game.player2Id = player2Id;
          resolve({
            roomId,
            player1Id,
            player2Id,
          });
        }
      });
    });
  }

  public startGame(server: Server, roomId: string): GameData {
    const game = this.inMemoryStorage[this.getGameIdxByRoomId(roomId)];
    const ready = !!game.player1Id && !!game.player2Id;
    if (ready) {
      const player1Data = { task: this.createTask(), score: 0 };
      const player2Data = { task: this.createTask(), score: 0 };
      game[game.player1Id] = player1Data;
      game[game.player2Id] = player2Data;
      game.timeCounter = 120;
      this.startCounter(server, game);
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
    if (this.checkMatch(game, playerId, playerColor)) {
      game[playerId].score = this.getNewScore(game, playerId, 1);
      game.match = true;
      game[playerId].task = this.createTask();
    } else {
      game[playerId].score = this.getNewScore(game, playerId, -2);
    }
    return game;
  }

  private startCounter(server: Server, game: GameData) {
    const interval = setInterval(() => {
      game.timeCounter -= 1;
      server.to(game.roomId).emit(GameEvent.TimeCounterUpdate, game);
      if (game.timeCounter <= 0) {
        server.to(game.roomId).emit(GameEvent.GameOver, game);
        clearInterval(interval);
      }
    }, 1000);
  }

  private checkMatch(
    game: GameData,
    playerId: string,
    playerColor: Color
  ): boolean {
    if (game[playerId].task.label === playerColor) {
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
    if (gameIdx < 0) {
      throw new Error('RoomNotFound');
    }
    return gameIdx;
  }

  private getNewScore(
    game: GameData,
    playerId: string,
    scoreDelta: number
  ): number {
    const currentScore = (game[playerId] as PlayerData).score;
    return currentScore + scoreDelta > 0 ? currentScore + scoreDelta : 0;
  }
}
