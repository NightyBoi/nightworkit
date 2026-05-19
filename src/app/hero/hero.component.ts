import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  lit = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.timer = setTimeout(() => { this.lit = true; }, 350);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  onLine1Hover(): void { this.lit = false; }
  onLine2Hover(): void { this.lit = true; }
}
