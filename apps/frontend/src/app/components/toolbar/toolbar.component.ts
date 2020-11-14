import { Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { HowToDialogComponent } from '../dialogs/how-to/how-to.dialog.component';

@Component({
  selector: 'angular-multiplayer-reaction-toolbar',
  templateUrl: 'toolbar.component.html',
})
export class ToolbarComponent {
  constructor(public dialog: MatDialog) {}

  public onCreateGame() {
    console.log('create game clicked');
  }

  public onHowTo() {
    this.dialog.open(HowToDialogComponent);
  }

  public onJoinGame() {
    console.log('join game clicked');
  }
}
