import { Component, Input } from '@angular/core';
import { GameTask } from 'tools/schematics';
import { ColorCodeMap } from '../../constants';

@Component({
  selector: 'angular-multiplayer-reaction-game-screen',
  templateUrl: 'game-screen.component.html',
  styleUrls: ['game-screen.component.scss'],
})
export class GameScreenComponent {
  @Input() public set task(value: GameTask) {
    if (value && value.background && value.label) {
      this.label = value.label.toUpperCase();
      this.bgColorHex = ColorCodeMap[value.background];
    } else {
      this.label = 'TASK';
      this.bgColorHex = '#ffffff';
    }
  }

  public label: string;

  public bgColorHex: string;
}
