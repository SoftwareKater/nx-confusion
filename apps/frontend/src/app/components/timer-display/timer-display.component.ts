import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-confusion-timer-display',
  templateUrl: 'timer-display.component.html',
  styleUrls: ['timer-display.component.scss'],
})
export class TimerDisplayComponent {
  @Input() public timer = 120;
}
