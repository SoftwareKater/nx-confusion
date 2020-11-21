import { Component, EventEmitter, Output } from '@angular/core';
import { Color } from 'tools/schematics';

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
    console.log(color);
    this.buttonPressed.emit(color);
  }
}
