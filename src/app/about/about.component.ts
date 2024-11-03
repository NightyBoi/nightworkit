import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../state-manager.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {

  currentMoon = false;

  constructor(private stateManager: StateManagerService){}

  ngOnInit(): void {
      this.stateManager.moonChanged.subscribe(
        () => {
          this.currentMoon = this.stateManager.getMoon();
        }
      )
  }
}
