import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { CreateGameDialogComponent } from './components/dialogs/create-game/create-game.dialog.component';
import { HowToDialogComponent } from './components/dialogs/how-to/how-to.dialog.component';
import { JoinGameDialogComponent } from './components/dialogs/join-game/join-game.dialog.component';
import { GameCreatedSnackbarComponent } from './components/snackbars/game-created/game-created.snackbar.component';
import { GameScreenComponent } from './components/game-screen/game-screen.component';
import { MainComponent } from './components/main/main.component';
import { ButtonPanelComponent } from './components/button-panel/button-panel.component';
import { ScoreBoardComponent } from './components/score-board/score-board.component';

const COMPONENT_DECLARATIONS = [
  ButtonPanelComponent,
  GameScreenComponent,
  MainComponent,
  ScoreBoardComponent,
  ToolbarComponent,
];

const DIALOG_DECLARATIONS = [
  CreateGameDialogComponent,
  HowToDialogComponent,
  JoinGameDialogComponent,
];

const SNACKBAR_DECLARATIONS = [GameCreatedSnackbarComponent];

const MATERIAL_IMPORTS = [
  MatButtonModule,
  MatDialogModule,
  MatMenuModule,
  MatIconModule,
  MatInputModule,
  MatSnackBarModule,
  MatToolbarModule,
];

@NgModule({
  declarations: [
    AppComponent,
    ...COMPONENT_DECLARATIONS,
    ...DIALOG_DECLARATIONS,
    ...SNACKBAR_DECLARATIONS,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ...MATERIAL_IMPORTS,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
