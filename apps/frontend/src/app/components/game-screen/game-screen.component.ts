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
    this.label = value.label;
    this.bgColorHex = ColorCodeMap[value.background];
  }

  public label: string;

  public bgColorHex: string;
}
