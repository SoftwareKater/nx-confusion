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
  declarations: [AppComponent, ToolbarComponent, ...DIALOG_DECLARATIONS, ...SNACKBAR_DECLARATIONS],
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
