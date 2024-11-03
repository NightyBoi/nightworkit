import { Component, OnInit } from '@angular/core';
import { delay, of } from 'rxjs';
import { CtaComponent } from '../cta/cta.component';
import { StateManagerService } from '../state-manager.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CtaComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {

  currentMoon: boolean = false;
  moonChanged: boolean = false;

  constructor(private stateManager: StateManagerService){}

  ngOnInit(): void {
      of(false)
      .pipe(delay(3500))
      .subscribe(
        response => {
          if(!this.moonChanged) {
            this.stateManager.setMoon(true);
            this.unblurMoon(true);
          }
        }
      )
  }

  unblurMoon(moonBlurred: boolean){
    this.moonChanged = true;
    if(moonBlurred){
      this.currentMoon = true;
      this.stateManager.setMoon(true);
    }else{
      this.currentMoon = false;
      this.stateManager.setMoon(false);
    }
  }

}
