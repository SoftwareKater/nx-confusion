# Creating a Multiplayer Game with Angular and Nestjs

## Introduction

In this article you will see how to create a simple multiplayer game using Angular as the frontend technology and Nestjs for the backend. Everything will be wrapped into one single mono repository using NxDev, a cli that leverages the Angular cli. Socketio will help coping with the challenges that a real-time multiplayer game poses. Angular Material will save time on the frontend design.

### What This Is Not

There will not be any databases, so no persistence of any kinds of information. This also implies that there is no authentication or any form of account. We will also exclude continuous integration, version control systems and testing.

## From the Idea to the Mockup to the Architecture

The game is a simple 2 player reaction game that is all about eye-hand coordination. It works as follows. Each player has four buttons - blue, orange, purple, and red. A big label in the middle of the screen displays the name of one of these colors. The background color of this label is randomly chosen among the other colors. The players have to press the button matching the word (not the background color). Hitting the right button earns one point. Wrong clicks loose 2 points. The first one to receive a total of 10 points wins.

(Show ui mockup here)

(List a set of requirements here)
* Users shall be able to interact with the UI via touch, clicks, and keyboard strokes.

(Show architecture scetch here)

## Set up Development Environment

For the next section you need to have a nx workspace with the angular and nestjs plugins up and running. If you know how to do this, you may well skip this section an move on to the next section. Just make sure that you have an nx workspace with a nestjs app and an angular app set up before you start the next section. Stay here if you want to learn how to bootstrap a mono repository with nxdev.

Install node, verify that:

```shell
λ npm --version
6.14.8

λ node --version
v14.15.0
```

Install angular and nxdev

```shell
λ npm i -g @angular/cli@10.0.0

λ npm i -g nx
```

Create a new nx workspace

```shell
λ npx create-nx-workspace@latest
npx: Installierte 182 in 16.475s
? Workspace name (e.g., org name)     angular-multiplayer-reaction
? What to create in the new workspace empty             [an empty workspace with a layout that works best for building apps]
? CLI to power the Nx workspace       Nx           [Recommended for all applications (React, Node, etc..)]
? Use Nx Cloud? (It's free and doesn't require registration.) No
```

Install angular and nestjs plugins

```shell
λ npm i -D @nrwl/angular
λ npm i -D @nrwl/nest
```

Create the backend app

```shell
λ nx g @nrwl/nest:app backend
```

Create the frontend app

```
λ nx g @nrwl/angular:app
? What name would you like to use for the application? frontend
? Which stylesheet format would you like to use? SASS(.scss)  [ http://sass-lang.com   ]
? Would you like to configure routing for this application? No
```

## Implementation

As a first step we will construct a simple backend that provides handlers for clients to connect and send messages. And a simple frontend that connects to the backend and sends some test messages.

### Step 1: Dummy Backend and Frontend

Let's install some packages that we will need along the way.

```shell
λ npm i --save @nestjs/websockets @nestjs/platform-socket.io
λ npm i --save-dev @types/socket.io
λ npm install uuid
```

Lay the foundation of our game module, where we handle everything related to the game.

```shell
λ nx g @nrwl/nest:module -p backend --directory app game
λ nx g @nrwl/nest:gateway -p backend --directory app game
λ nx g @nrwl/nest:service -p backend --directory app game
```

The gateway will serve as the entrance to our backend. Clients that connect or send messages to the backend will be served by the gateway.

```typescript
apps/backend/app/game/game.gateway.ts

import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateGameResponse } from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(@ConnectedSocket() soc: Socket): CreateGameResponse {
    const result = this.gameService.createGame(soc);
    return result;
  }
}
```

For the tough work, the gateway will employ the game service.

```typescript
apps/backend/app/game/game.service.ts

import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateGameResponse } from 'tools/schematics';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameService {
  public createGame(socket: Socket): CreateGameResponse {
    const roomId = uuid();
    const player1Id = socket.id
    socket.join(roomId, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Successfully created new room ${roomId} and connected player1 ${player1Id}`);
      }
    });
    return {
        roomId,
        player1Id,
    }
  }
}
```

As you can see from the line `import { CreateGameResponse } from 'tools/schematics';` we keep the types at the common place `tools/schematics`. That folder was created when we first bootstrapped the nxDev mono repo.

```typescript
tools/schematics/create-game-response.interface.ts

export interface CreateGameResponse {
  roomId?: string;
  player1Id?: string;
}
```

```typescript
tools/schematics/index.ts

export * from './create-game-response.interface';
```

Lets turn to the frontend. Create a socket service that handles the connection and communication with the backend.

```shell
λ npm install --save @types/socket.io-client
```

```typescript
apps/frontend/src/app/socket.service.ts

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
```

Inject the socket service into the app component, by adding it to the constructor parameters. Angulars dependency injeciton system will take care of providing the singleton instance of the socket service to the app component.

```typescript
apps/frontend/src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'angular-multiplayer-reaction-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private readonly socketService: SocketService) {}

  ngOnInit() {
    this.socketService.connect();
    this.socketService.createGame();
  }
}
```

Now serve both the frontend and the backend. To do that open two console windows and issue

```
λ nx serve frontend
λ nx serve backend
```

While keeping an eye on the backend console, open your browser at `http://localhost:4200`. Upon rendering the default nx dev welcome page (that we will soon erase), the backend console should log something like

```shell
Successfully created new room efa8fb98-6d2e-41d0-aadc-f99adac6563c and connected player1 366q_Ql0gJhMJ3AsAAAB
```

Great! We conneted a frontend dummy to a backend dummy and already they already started to communicate. Lets dive deeper!

### Step 2: Sophisticating the Backend
