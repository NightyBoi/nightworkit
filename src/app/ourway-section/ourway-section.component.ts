import { Component } from '@angular/core';
import { OurwayComponent } from './ourway/ourway.component';

@Component({
  selector: 'app-ourway-section',
  standalone: true,
  imports: [OurwayComponent],
  templateUrl: './ourway-section.component.html',
  styleUrl: './ourway-section.component.scss'
})
export class OurwaySectionComponent {

}
