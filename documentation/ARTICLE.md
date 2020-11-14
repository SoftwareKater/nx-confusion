# Creating a Multiplayer Game with Angular and Nestjs

## Introduction

In this article you will see how to create a simple multiplayer game using Angular as the frontend technology and Nestjs for the backend. Everything will be wrapped into one single mono repository using NxDev, a cli that leverages the Angular cli. Socketio will help coping with the challenges that a real-time multiplayer game poses. Angular Material will save time on the frontend design.

### What This Is Not

There will not be any databases, so no persistence of any kinds of information. This also implies that there is no authentication or any form of account. We will also exclude continuous integration, version control systems and testing.

## From the Idea to the Mockup to the Architecture

The game is a simple 2 player reaction game that is all about eye-hand coordination. It works as follows. Each player has four buttons - blue, yellow, purple, and red. A big label in the middle of the screen displays the name of one of these colors. The background color of this label is randomly chosen among the other colors. The players have to press the button matching the word (not the background color). Hitting the right button earns one point. Wrong clicks loose 2 points. The first one to receive a total of 10 points wins.

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
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateGameResponse } from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(
    @ConnectedSocket() soc: Socket
  ): WsResponse<CreateGameResponse> {
    const result = this.gameService.createGame(soc);
    return { event: 'game-created', data: result };
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

Before we serve the apps, lets fix a warning that would otherwise pop up in our frontend. Go to `workspace.json` and add `socket.io-client` to the allowed common js dependencies (https://angular.io/guide/build#configuring-commonjs-dependencies).

```json
    ...
  },
  "frontend": {
    "projectType": "application",
    "schematics": {
      "@schematics/angular:component": {
        "style": "scss"
      }
    },
    "root": "apps/frontend",
    "sourceRoot": "apps/frontend/src",
    "prefix": "angular-multiplayer-reaction",
    "architect": {
      "build": {
        "builder": "@angular-devkit/build-angular:browser",
        "options": {
          "allowedCommonJsDependencies": [
            "socket.io-client"
          ],
          ...
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

### Step 2: Joining Game (-Rooms)

This time we will start with the data structures. Joining a game requires a room number. So a request to join a game must provide that.

```typescript
tools/schemas/join-game-request.interface.ts

export interface JoinGameRequest {
  roomId: string;
}
```

If a client joins a room he needs to now which name he goes by in that room. Also he might want to know what his opponent is called.

```typescript
tools/schemas/join-game-response.interface.ts

export interface JoinGameResponse {
    roomId?: string;
    player1Id?: string;
    player2Id?: string;
  }
```

We will build an in-memory storage to keep track of all games that we have created. This will also be the place to save the data that is manipulated by our backend (we do not want to handle scores in the client).

```typescript
tools/schemas/game-data.interface.ts

export interface GameData {
  roomId?: string;
  player1Id?: string;
  player1Score?: number;
  player2Id?: string;
  player2Score?: number;
}
```

Don't forget to add the new interfaces to the index file. Otherwise our editor/ide will not be able to find them or suggest them for auto-importing.

```typescript
tools/schemas/index.ts

export * from './create-game-response.interface';
export * from './game-data.interface';
export * from './join-game-request.interface';
export * from './join-game-response.interface';
```

In the gateway, add a new handler and wrap execution of all handlers into a try-catch block.

```typescript
apps/backend/app/game/game.gateway.ts

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
} from 'tools/schematics';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create-game')
  handleCreateGame(
    @ConnectedSocket() soc: Socket
  ): WsResponse<CreateGameResponse> {
    try {
      const result = this.gameService.createGame(soc);
      return { event: 'game-created', data: result };
    } catch (err) {
      return { event: 'error-creating', data: err.message };
    }
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() req: JoinGameRequest,
    @ConnectedSocket() soc: Socket
  ): WsResponse<JoinGameResponse> {
    try {
      const result = this.gameService.joinGame(req, soc);
      return { event: 'game-joined', data: result };
    } catch (err) {
      return { event: 'error-joining', data: err.message };
    }
  }
}
```

Add the in-memory storage to the game service. Note that we now re-throw errors that occur in methods of the game service. All errors are handle on the top level in the gateway.

```typescript
apps/backend/app/game/game.service.ts

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
    const game = this.inMemoryStorage.find(g => g.roomId === roomId);
    if (!game) {
      throw new Error('RoomNotFoundError');
    }
    const player2Id = socket.id;
    const roomId = request.roomId;
    const player1Id = game.player1Id;
    socket.join(roomId, (err) => {
      if (err) {
        throw err;
      } else {
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
```

Lets try out our new joining functionality, by creating the counterparts in our client. Add event handlers to the socket connection using `this.connection.on(event: string, (res) => void)`. Add a `joinGame` method that emits the `join-game` event and sends the required message body.

```typescript
apps/frontend/src/app/socket.service.ts

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
```

In the OnInit life-cycle method of our app component, add a call to the new `joinGame` method.

```typescript
apps/frontend/src/app/app.component.ts

ngOnInit() {
  this.socketService.connect();
  this.socketService.createGame();
  this.socketService.joinGame('hallo');
}
```

Goto the browser tab, where the app is running and open the developer tools (F12). If you refresh you browser you will see one ACK and one error. The game creation succeeded, and in the corresponding ACK we can find our roomId and our player1Id, which is our `socket.id`. Since we created the game, we are automatically assigned as player 1. Joining the game however failed, because we joined the game that takes place in the room `hello`. But this room does not exists, therefore joining the game had all the rights to fail.

## Interacting with the Client

We have made a huge step. Our client-server (frontend-backend) communcation now works both ways. The client emits events, to trigger the server. The server reacts and in turn sends events back to the client. The client again consumes the returned events and prints them to console. However, this is all static and we as a user cannot interact in the client-server communication. So before turning to the game logic, lets put a little work into our UI. In this section we will create the overall layout and menu items.

### Angular Material

```shell
λ npm i @angular/material @angular/cdk
```

Add one of the prebuilt themes to styles array in `workspace.json`. It is a sibling of the `allowedCommonJsDependencies` array.

```json

  "styles": [
    "./node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
    "apps/frontend/src/styles.scss"
  ],
```

Update the `index.html` with the material design icon font.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Frontend</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <!-- Material Design Icon Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </head>
  <body class="mat-typography">
    <angular-multiplayer-reaction-root></angular-multiplayer-reaction-root>
  </body>
</html>
```

Delete the contents of `app.component.html` and `app.component.scss`. Update `styles.scss`.

```scss
html,
body {
  height: 100%;
}
body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
  background-color: whitesmoke;
}
```

### Toolbar

Now we are ready to start working on the user interface. Create a toolbar component in a new `components` folder

```shell
nx g @nrwl/angular:component --project=frontend components/toolbar
```

Create a toolbar holding the title of the app and a menu.

```html
frontend/src/app/components/toolbar/toolbar.component.html

<mat-toolbar color="primary">
  <button
    mat-icon-button
    [matMenuTriggerFor]="menu"
    aria-label="Example icon-button with a menu"
  >
    <mat-icon>more_vert</mat-icon>
  </button>
  <mat-menu #menu>
    <button mat-menu-item (click)="onHowTo()">
      <mat-icon>help</mat-icon>
      <span>How To</span>
    </button>
    <button mat-menu-item (click)="onCreateGame()">
      <mat-icon>stars</mat-icon>
      <span>Create Game</span>
    </button>
    <button mat-menu-item (click)="onJoinGame()">
      <mat-icon>play_circle_filled</mat-icon>
      <span>Join Game</span>
    </button>
  </mat-menu>
  <span>2 Player Reaction</span>
</mat-toolbar>
```

In the typscript file add click handlers.

```typescript
frontend/src/app/components/toolbar/toolbar.component.ts

import { Component } from '@angular/core';

@Component({
    selector: 'angular-multiplayer-reaction-toolbar',
    templateUrl: 'toolbar.component.html'
})

export class ToolbarComponent {
    public onCreateGame() {
        console.log('create game clicked');
    }

    public onHowTo() {
        console.log('how to clicked');
    }

    public onJoinGame() {
        console.log('join game clicked');
    }
}
```

Add the new component to `app.component.html`

```html
<angular-multiplayer-reaction-toolbar></angular-multiplayer-reaction-toolbar>
```

In order to make everything work, we have to import all the material stuff that we are using.

```typescript
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

const MATERIAL_IMPORTS = [
  MatButtonModule,
  MatMenuModule,
  MatIconModule,
  MatToolbarModule,
];

@NgModule({
  declarations: [AppComponent, ToolbarComponent],
  imports: [BrowserAnimationsModule, BrowserModule, ...MATERIAL_IMPORTS],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

At this point you can fire up the apps again and check out our new UI.

### Dialogs

We will use modal dialogs to communicate with the user. All the entries in the menu will show a different dialog. The "how to"-dialog will show a small text on how to create/join games and how to play. The "create game"-dialog will eventually call the `createGame` method of our socket service. Likewise the "join game"-dialog will call the `joinGame` method, but moreover it will display an input field so that the user can enter the room id.

Create a new folder `components/dialogs` where we keep all the dialogs we are about to create. Inside that create a new folder `how-to` and add the following two files

```html
frontend/src/app/components/dialogs/how-to/how-to.dialog.component.html

<h1 mat-dialog-title>How To</h1>
<div mat-dialog-content>Describe the game. Describe the other menu items.</div>
<div mat-dialog-actions>
  <button mat-button mat-dialog-close>Close</button>
</div>
```

```typescript
frontend/src/app/components/dialogs/how-to/how-to.dialog.component.ts

import { Component } from '@angular/core';

@Component({
  selector: 'angular-multiplayer-reaction-how-to-dialog',
  templateUrl: 'how-to.dialog.component.html',
})
export class HowToDialogComponent {}
```

To wire the dialog and the how to menu item, import the `HowToDialogComponent` into the toolbar component and change the callback method.

```typescript
frontend/src/app/components/toolbar/toolbar.component.ts

public onHowTo() {
  this.dialog.open(HowToDialogComponent);
}
```

Repeat this for the other two dialogs.







## Conclusion

### Next Steps

We accumulated a lot of technical debt on our way to a basic multiplayer game. A refactoring will help to add new features to the app. Ideas for refactorings include:
* Extract the in-memory storage from the game service and create a dedicated service for the in-memory storage.
* Divide the game service along its two purposes: managing rooms (createGame, joinGame), managing games (...). Before you do this, you should definetly extract the in-memory storage.
*