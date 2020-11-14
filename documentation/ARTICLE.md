# Creating a Multiplayer Game with Angular and Nestjs

## Introduction

In this article you will see how to create a simple multiplayer game using Angular as the frontend technology and Nestjs for the backend. Everything will be wrapped into one single mono repository using NxDev, a cli that leverages the Angular cli. Socketio will help coping with the challenges that a real-time multiplayer game poses. Angular Material will save time on the frontend design.

### What This Is Not

There will not be any databases, so no persistence of any kinds of information. This also implies that there is no authentication or any form of account. We will also exclude continuous integration, version control systems and testing.

## From the Idea to the Mockup to the Architecture

The game is a simple 2 player reaction game. It works as follows. Each player has four buttons - blue, orange, purple, and red. A big label in the middle of the screen displays the name of one of these colors. The background color of this label is randomly chosen among the other colors. The players have to press the button matching the word (not the background color). Hitting the right button earns one point. Wrong clicks loose 2 points. The first one to receive a total of 10 points wins.

(Show ui scetch here)

Users shall be able to interact with the UI via touch, clicks, and keyboard strokes.


## Set up Development Environment

For the next section you need to have a nx workspace with the angular and nestjs plugins up and running. If you know how to do this, you may well skip this section an move on to create the client. Stay here if you want to learn how to bootstrap a mono repository with nxdev.

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

## Backend

```shell
λ nx g @nrwl/nest:app backend

λ npm i --save @nestjs/websockets @nestjs/platform-socket.io
λ npm i --save-dev @types/socket.io
```

Lay the foundation of our game module, where we handle everything related to the game.

```shell
λ nx g @nrwl/nest:module -p backend --directory app game
λ nx g @nrwl/nest:gateway -p backend --directory app game
λ nx g @nrwl/nest:service -p backend --directory app game
```