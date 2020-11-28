import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { GameCreatedSnackbarComponent } from '../components/snackbars/game-created/game-created.snackbar.component';
import {
  Color,
  CreateGameResponse,
  GameData,
  GameScore,
  GameState,
  JoinGameResponse,
} from '@angular-multiplayer-reaction/types';

let STATE: GameState = {
  task: null,
  playerMove: null,
  score: null,
  loading: true,
};

@Injectable({ providedIn: 'root' })
export class GameFacade {
  private roomId: string;
  private playerId: string;
  private store = new BehaviorSubject<GameState>(STATE);
  private state$ = this.store.asObservable();

  task$ = this.state$.pipe(
    map((state) => state.task),
    distinctUntilChanged()
  );
  playerMove$ = this.state$.pipe(
    map((state) => state.playerMove),
    distinctUntilChanged()
  );
  score$ = this.state$.pipe(
    map((state) => state.score),
    distinctUntilChanged()
  );
  loading$ = this.state$.pipe(map((state) => state.loading));

  /**
   * Viewmodel that resolves once all the data is ready (or updated)...
   */
  public viewModel$: Observable<GameState> = combineLatest([
    this.task$,
    this.playerMove$,
    this.score$,
    this.loading$,
  ]).pipe(
    map(([task, playerMove, score, loading]) => {
      return { task, playerMove, score, loading };
    })
  );

  /**
   * Watch streams to trigger backend communication and state updates
   */
  constructor(
    private snackBar: MatSnackBar,
    private readonly socketService: SocketService
  ) {
    this.playerMove$
      .pipe(
        tap((playerMove: Color) => {
          if (playerMove) {
            this.socketService.playerMove(
              playerMove,
              this.roomId,
              this.playerId
            );
          }
        })
      )
      .subscribe(() => {
        const playerMove = null;
        this.updateState({ ...STATE, playerMove, loading: false });
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

  public updatePlayerMove(playerMove: Color): void {
    this.updateState({ ...STATE, playerMove, loading: true });
  }

  private createHandlers() {
    this.socketService.createHandler(
      'game-created',
      (res: CreateGameResponse) => {
        this.roomId = res.roomId;
        this.playerId = res.player1Id;
        this.snackBar.openFromComponent(GameCreatedSnackbarComponent, {
          data: {
            roomId: res.roomId,
          },
        });
      }
    );
    this.socketService.createHandler('error-creating', (errMsg: string) => {
      this.snackBar.open(`Error while creating the game: ${errMsg}`, '', {
        duration: 2500,
      });
    });
    this.socketService.createHandler('game-joined', (res: JoinGameResponse) => {
      this.roomId = res.roomId;
      this.playerId = res.player2Id;
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
        this.socketService.startGame(this.roomId);
      }
    );
    this.socketService.createHandler('error-joining', (errMsg: string) => {
      this.snackBar.open(`Error while joining the game: ${errMsg}`, '', {
        duration: 2500,
      });
    });
    this.socketService.createHandler('new-score', (res: GameData) => {
      const score = {
        ...STATE.score,
        player1: res.player1Score,
        player2: res.player2Score,
      };
      this.updateState({ ...STATE, score, loading: false });
    });
    this.socketService.createHandler('new-task', (res: GameData) => {
      this.updateState({ ...STATE, task: res.task, loading: false });
    });
  }

  /** Update internal state cache and emit from store... */
  private updateState(state: GameState) {
    this.store.next((STATE = state));
  }
}
