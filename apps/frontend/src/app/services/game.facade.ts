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
  GameEvent,
  GameScore,
  GameState,
  JoinGameResponse,
} from '@nx-confusion/types';

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

  /**
   * Returns true if the player won the game.
   */
  private checkGameWon(gameData: GameData) {
    return (
      (gameData.player1Score > gameData.player2Score &&
        this.playerId === gameData.player1Id) ||
      (gameData.player1Score < gameData.player2Score &&
        this.playerId === gameData.player2Id)
    );
  }

  private createHandlers() {
    this.createHandlerErrorCreating();
    this.createHandlerErrorJoining();
    this.createHandlerGameCreated();
    this.createHandlerGameJoined();
    this.createHandlerGameOver();
    this.createHandlerPlayerJoined();
    this.socketService.createHandler(GameEvent.NewScore, (res: GameData) => {
      const score = {
        ...STATE.score,
        player1: res.player1Score,
        player2: res.player2Score,
      };
      this.updateState({ ...STATE, score, loading: false });
    });
    this.socketService.createHandler(GameEvent.NewTask, (res: GameData) => {
      this.updateState({ ...STATE, task: res.task, loading: false });
    });
  }

  private createHandlerErrorCreating() {
    this.socketService.createHandler(
      GameEvent.ErrorCreating,
      (errMsg: string) => {
        this.snackBar.open(`Error while creating the game: ${errMsg}`, '', {
          duration: 2500,
        });
      }
    );
  }

  private createHandlerErrorJoining() {
    this.socketService.createHandler(
      GameEvent.ErrorJoining,
      (errMsg: string) => {
        this.snackBar.open(`Error while joining the game: ${errMsg}`, '', {
          duration: 2500,
        });
      }
    );
  }

  private createHandlerGameCreated() {
    this.socketService.createHandler(
      GameEvent.GameCreated,
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
  }

  private createHandlerGameJoined() {
    this.socketService.createHandler(
      GameEvent.GameJoined,
      (res: JoinGameResponse) => {
        this.roomId = res.roomId;
        this.playerId = res.player2Id;
        this.snackBar.open(`Joined player 1 ${res.player1Id}`, '', {
          duration: 2500,
        });
      }
    );
  }

  private createHandlerGameOver() {
    this.socketService.createHandler(GameEvent.GameOver, (res: GameData) => {
      if (res.player1Score === res.player2Score) {
        this.snackBar.open('Tie!', '', {
          duration: 2500,
        });
      }
      if (this.checkGameWon(res)) {
        this.snackBar.open(`Game Over - You Win`, 'Great!', {
          duration: 2500,
        });
      } else {
        this.snackBar.open('Game Over - You loose', 'Nah!', {
          duration: 2500,
        });
      }
    });
  }

  private createHandlerPlayerJoined() {
    this.socketService.createHandler(
      GameEvent.PlayerJoined,
      (res: JoinGameResponse) => {
        this.snackBar.open(`Player 2 ${res.player2Id} joined your game.`, '', {
          duration: 2500,
        });
        this.socketService.startGame(this.roomId);
      }
    );
  }

  /** Update internal state cache and emit from store... */
  private updateState(state: GameState) {
    this.store.next((STATE = state));
  }
}
