import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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
import {
  Color,
  CreateGameResponse,
  GameData,
  GameScore,
  GameState,
  JoinGameResponse,
} from 'tools/schematics';
import { SocketService } from './socket.service';
import { GameCreatedSnackbarComponent } from './components/snackbars/game-created/game-created.snackbar.component';

let STATE: GameState = {
  playerMove: null,
  score: null,
  loading: true,
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
  constructor(
    private snackBar: MatSnackBar,
    private readonly socketService: SocketService
  ) {
    this.playerMove$
      .pipe(
        map((playerMove: Color) => {
          //   console.log(playerMove);
        })
      )
      .subscribe(() => {
        this.updateState({ ...STATE, loading: false });
      });
  }

  public init() {
    this.socketService.connect();
    const score: GameScore = { player1: 0, player2: 0 };
    this.updateState({ ...STATE, score, loading: false });
    this.createHandlers();
  }

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

  private createHandlers() {
    this.socketService.createHandler(
      'game-created',
      (res: CreateGameResponse) => {
        this.snackBar.openFromComponent(GameCreatedSnackbarComponent, {
          data: {
            roomId: res.roomId,
          },
        });
      }
    );
    this.socketService.createHandler('error-creating', (errMsg: string) => {
      console.error('Error while creating a game: ', errMsg);
    });
    this.socketService.createHandler('game-joined', (res: JoinGameResponse) => {
      this.snackBar.open(`Joined player 1 ${res.player1Id}`, '', {
        duration: 2500,
      });
    });
    this.socketService.createHandler(
      'player-joined',
      (res: JoinGameResponse) => {
        this.snackBar.open(`Player 2 ${res.player2Id} joined your game.`, '', {
          duration: 2500,
        });
      }
    );
    this.socketService.createHandler('error-joining', (errMsg: string) => {
      console.log('Error while joining a game: ', errMsg);
    });
  }

  /** Update internal state cache and emit from store... */
  private updateState(state: GameState) {
    this.store.next((STATE = state));
  }
}
