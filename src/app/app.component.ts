import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { TechnologiesComponent } from './technologies/technologies.component';
import { AboutComponent } from './about/about.component';
import { OurwaySectionComponent } from './ourway-section/ourway-section.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ClientInfoComponent } from './client-info/client-info.component';
import { ServicesComponent } from './services/services.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeroComponent, TechnologiesComponent, AboutComponent, OurwaySectionComponent, ClientInfoComponent, ServicesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'official';

  isPhone: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([
      '(max-width: 767px)' // Phone
    ]).subscribe((state: BreakpointState) => {
      this.isPhone = state.breakpoints['(max-width: 767px)'] || false;
    });
  }
}
