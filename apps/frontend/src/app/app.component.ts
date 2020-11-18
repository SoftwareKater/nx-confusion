import { Component, OnInit } from '@angular/core';
import { GameFacade } from './game.facade';
@Component({
  selector: 'angular-multiplayer-reaction-root',
  template: `
    <angular-multiplayer-reaction-main> </angular-multiplayer-reaction-main>
  `,
})
export class AppComponent implements OnInit {
  constructor(private readonly gameFacade: GameFacade) {}
  ngOnInit() {
    this.gameFacade.init();
  }
}
