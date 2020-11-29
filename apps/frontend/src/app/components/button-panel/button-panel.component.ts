import { Color } from '@nx-confusion/types';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'nx-confusion-button-panel',
  templateUrl: 'button-panel.component.html',
  styleUrls: ['button-panel.component.scss'],
})
export class ButtonPanelComponent {
  @Output() buttonPressed = new EventEmitter<Color>();

  public get color(): typeof Color {
    return Color;
  }

  public onClick(color: Color) {
    this.buttonPressed.emit(color);
  }
}
