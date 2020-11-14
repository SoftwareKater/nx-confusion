import { Component } from '@angular/core';

@Component({
    selector: 'angular-multiplayer-reaction-toolbar',
    templateUrl: 'toolbar.component.html'
})

export class ToolbarComponent {
    public onCreateGame() {
        console.log('create game clicked');
    }

    public onHowTo() {
        console.log('how to clicked');
    }

    public onJoinGame() {
        console.log('join game clicked');
    }
}