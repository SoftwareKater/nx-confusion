import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameState } from 'tools/schematics';
import { GameFacade } from '../../game.facade';

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
}
