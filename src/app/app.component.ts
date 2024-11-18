import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { TechnologiesComponent } from './technologies/technologies.component';
import { AboutComponent } from './about/about.component';
import { OurwaySectionComponent } from './ourway-section/ourway-section.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ClientInfoComponent } from './client-info/client-info.component';
import { ServicesComponent } from './services/services.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { StateManagerService } from './state-manager.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent, TechnologiesComponent, AboutComponent, OurwaySectionComponent, ClientInfoComponent, ServicesComponent, ContactComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'official';

  isPhone: boolean = false;
  isMediumScreen: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver, private StateManager: StateManagerService) {
    this.breakpointObserver.observe([
      '(max-width: 767px)', // Phone
      '(max-width: 1000px) and (min-width: 768px)' // Table and Medium Screens
    ]).subscribe((state: BreakpointState) => {
      this.isPhone = state.breakpoints['(max-width: 767px)'] || false;
      this.isMediumScreen = state.breakpoints['(max-width: 1000px) and (min-width: 768px)'] || false;
      this.StateManager.setScreen(this.isMediumScreen);
    });
  }
}
