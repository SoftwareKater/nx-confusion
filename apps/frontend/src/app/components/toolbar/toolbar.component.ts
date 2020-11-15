import { Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../socket.service';
import { CreateGameDialogComponent } from '../dialogs/create-game/create-game.dialog.component';
import { HowToDialogComponent } from '../dialogs/how-to/how-to.dialog.component';
import { JoinGameDialogComponent } from '../dialogs/join-game/join-game.dialog.component';

@Component({
  selector: 'angular-multiplayer-reaction-toolbar',
  templateUrl: 'toolbar.component.html',
})
export class ToolbarComponent {
  constructor(
    public dialog: MatDialog,
    private readonly socketService: SocketService
  ) {}

  public onCreateGame() {
    const dialog = this.dialog.open(CreateGameDialogComponent);
    dialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.socketService.createGame();
      }
    });
  }

  public onHowTo() {
    this.dialog.open(HowToDialogComponent);
  }

  public onJoinGame() {
    const dialog = this.dialog.open(JoinGameDialogComponent);
    dialog.afterClosed().subscribe((roomId: string) => {
      if (roomId) {
        this.socketService.joinGame(roomId);
      }
    });
  }
}