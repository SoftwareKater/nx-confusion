import { Component } from '@angular/core';
import { Color } from 'tools/schematics';
import { GameFacade } from '../../game.facade';

@Component({
  selector: 'angular-multiplayer-reaction-button-panel',
  templateUrl: 'button-panel.component.html',
  styleUrls: ['button-panel.component.scss'],
})
export class ButtonPanelComponent {

  constructor(private readonly gameFacade: GameFacade){}

  public onClick(color: Color) {
    this.gameFacade.updatePlayerMove(color);
  }
}
