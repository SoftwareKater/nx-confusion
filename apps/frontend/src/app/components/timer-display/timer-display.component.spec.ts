import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreBoardComponent } from './score-board.component';

describe('ScoreBoardComponent', () => {
  let component: ScoreBoardComponent;
  let fixture: ComponentFixture<ScoreBoardComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ScoreBoardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('score', () => {
    it('should deal with bad inputs', () => {
      component.player1Score = '';
      component.score = null;
      expect(component.player1Score).toBe('00');

      component.player2Score = '';
      component.score = undefined;
      expect(component.player2Score).toBe('00');
    });

    it('should set player 1 and player 2 score', () => {
      component.score = { player1: 3, player2: 8 };
      expect(component.player1Score).toBe('03');
      expect(component.player2Score).toBe('08');
    });
  });
});
