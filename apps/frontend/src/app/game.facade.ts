import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
  delay,
  debounceTime,
} from 'rxjs/operators';
import { Color } from 'tools/schematics';
import { SocketService } from './socket.service';

export interface GameScore {
  player1: number;
  player2: number;
}

export interface GameState {
  playerMove: Color;
  score: GameScore;
  loading: boolean;
}

let STATE: GameState = {
  playerMove: null,
  score: null,
  loading: false,
};

@Injectable({ providedIn: 'root' })
export class GameFacade {
  private store = new BehaviorSubject<GameState>(STATE);
  private state$ = this.store.asObservable();

  score$ = this.state$.pipe(
    map((state) => state.score),
    distinctUntilChanged()
  );
  playerMove$ = this.state$.pipe(
    map((state) => state.playerMove),
    distinctUntilChanged()
  );
  loading$ = this.state$.pipe(map((state) => state.loading));

  /**
   * Viewmodel that resolves once all the data is ready (or updated)...
   */
  public viewModel$: Observable<GameState> = combineLatest([
    this.playerMove$,
    this.score$,
    this.loading$,
  ]).pipe(
    map(([playerMove, score, loading]) => {
      return { playerMove, score, loading };
    })
  );

  /**
   * Watch 2 streams to trigger user loads and state updates
   */
  constructor() {
    this.playerMove$
      .pipe(
        map((color) => {
          return this.findAllUsers();
        })
      )
      .subscribe(() => {
        this.updateState({ ...STATE, loading: false });
      });
  }

  // ------- Public Methods ------------------------

  // Allows quick snapshot access to data for ngOnInit() purposes
  public getStateSnapshot(): GameState {
    return { ...STATE, score: { ...STATE.score } };
  }

  public updateScore(newScore: GameScore): void {
    const score = {
      ...STATE.score,
      player1: newScore.player1,
      player2: newScore.player2,
    };
    this.updateState({ ...STATE, score, loading: false });
  }

  // ------- Private Methods ------------------------

  /** Update internal state cache and emit from store... */
  private updateState(state: GameState) {
    this.store.next((STATE = state));
  }
}
