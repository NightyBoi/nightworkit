import { Component, Input } from '@angular/core';
import { OurwayComponent } from './ourway/ourway.component';
import { OurwayMobileComponent } from './ourway-mobile/ourway-mobile.component';

@Component({
  selector: 'app-ourway-section',
  standalone: true,
  imports: [OurwayComponent, OurwayMobileComponent],
  templateUrl: './ourway-section.component.html',
  styleUrl: './ourway-section.component.scss'
})
export class OurwaySectionComponent {

  @Input() isPhone!: boolean;
}
