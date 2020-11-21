import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Color, GameState } from 'tools/schematics';
import { GameFacade } from '../../services/game.facade';

@Component({
  selector: 'angular-multiplayer-reaction-main',
  templateUrl: 'main.component.html',
  styleUrls: ['main.component.scss'],
})
export class MainComponent implements OnInit {
  public vm$: Observable<GameState> = this.gameFacade.viewModel$;

  constructor(private readonly gameFacade: GameFacade) {}

  ngOnInit() {
    this.gameFacade.init();
  }

  public onButtonPressed($event: Color) {
    this.gameFacade.updatePlayerMove($event);
  }
}
