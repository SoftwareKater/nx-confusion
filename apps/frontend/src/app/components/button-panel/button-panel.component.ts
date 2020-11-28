import { Color } from '@angular-multiplayer-reaction/types';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'angular-multiplayer-reaction-button-panel',
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
