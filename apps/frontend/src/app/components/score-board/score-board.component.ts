import { GameScore } from '@nx-confusion/types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-confusion-score-board',
  templateUrl: 'score-board.component.html',
  styleUrls: ['score-board.component.scss'],
})
export class ScoreBoardComponent {
  @Input() set score(value: GameScore) {
    if (value) {
      this.player1Score = value.player1 > 9 ? '' + value.player1 : '0' + value.player1;
      this.player2Score = value.player2 > 9 ? '' + value.player2 : '0' + value.player2;
    } else {
      this.player1Score = '00';
      this.player2Score = '00';
    }
  }

  public player1Score: string;

  public player2Score: string;
}
