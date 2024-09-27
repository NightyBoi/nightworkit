import { Component, OnInit } from '@angular/core';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {


  currentMoon: boolean = false;
  moonChanged: boolean = false;

  ngOnInit(): void {
      of(false)
      .pipe(delay(3500))
      .subscribe(
        response => {
          if(!this.moonChanged) this.unblurMoon(true)
        }
      )
  }

  unblurMoon(moonBlurred: boolean){
    this.moonChanged = true;
    if(moonBlurred){
      this.currentMoon = true;
    }else{
      this.currentMoon = false;
    }
  }

}
