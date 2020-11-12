# Creating a Multiplayer Game with Angular and Nestjs

## Just writing down the commands here

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
