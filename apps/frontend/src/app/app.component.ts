import { Component, OnInit } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'angular-multiplayer-reaction-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private readonly socketService: SocketService) {}

  ngOnInit() {
    this.socketService.connect();
  }
}
