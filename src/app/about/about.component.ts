import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StateManagerService } from '../state-manager.service';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

  constructor(){}

}
