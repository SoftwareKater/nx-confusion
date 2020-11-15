import { Inject } from '@angular/core';
import { Component } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'angular-multiplayer-reaction-game-created-snackbar',
  templateUrl: 'game-created.snackbar.component.html',
})
export class GameCreatedSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private readonly snackBar: MatSnackBar
  ) {}

  public async copyRoomIdAndDismiss() {
    await navigator.clipboard.writeText(this.data.roomId);
    this.snackBar.open('Copied room ID to clipboard!', '', { duration: 1500 });
  }
}
