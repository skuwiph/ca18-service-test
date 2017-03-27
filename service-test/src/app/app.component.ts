import { Component } from '@angular/core';
import { WindowSize } from './shared/framework/window-size';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Step Suite Test';
  wsx: number;
  wsy: number;

  constructor(private window: WindowSize) {
  }

  ngOnInit() {
      this.window.height$.subscribe(
        h => this.wsy = h);
      this.window.width$.subscribe(
        w => this.wsx = w);
  }
}
