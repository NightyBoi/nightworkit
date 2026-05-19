import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { OurwayComponent } from './ourway/ourway.component';

@Component({
  selector: 'app-ourway-section',
  standalone: true,
  imports: [OurwayComponent],
  templateUrl: './ourway-section.component.html',
  styleUrl: './ourway-section.component.scss'
})
export class OurwaySectionComponent {
  @Input() isPhone!: boolean;
  @ViewChild('launchBtn') launchBtn!: ElementRef;

  journeyStarted = false;

  get isDesktop(): boolean {
    return !this.isPhone && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (min-width: 901px)').matches;
  }

  launchJourney(): void {
    this.journeyStarted = true;
  }
}
