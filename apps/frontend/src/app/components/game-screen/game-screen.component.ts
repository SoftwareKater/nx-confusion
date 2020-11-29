import { GameTask } from '@nx-confusion/types';
import { Component, Input } from '@angular/core';
import { ColorCodeMap } from '../../constants';

@Component({
  selector: 'nx-confusion-game-screen',
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
