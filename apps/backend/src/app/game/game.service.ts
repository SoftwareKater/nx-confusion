import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateGameResponse } from 'tools/schematics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameService {
  public createGame(socket: Socket): CreateGameResponse {
    const roomId = uuid();
    const player1Id = socket.id
    const joinedSocket = socket.join(roomId, (err: any) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Successfully created new room ${roomId} and connected player1 ${player1Id}`);
      }
    });
    console.log('joinedSocket ', joinedSocket);
    return {
        roomId,
        player1Id,
    }
  }
}
