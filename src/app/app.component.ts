import { Component } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TopNavComponent } from './top-nav/top-nav.component';
import { HeroComponent } from './hero/hero.component';
import { ClientInfoComponent } from './client-info/client-info.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { OurwaySectionComponent } from './ourway-section/ourway-section.component';
import { TechnologiesComponent } from './technologies/technologies.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TopNavComponent,
    HeroComponent,
    ClientInfoComponent,
    AboutComponent,
    ServicesComponent,
    OurwaySectionComponent,
    TechnologiesComponent,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isPhone = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe('(max-width: 900px)').subscribe((state: BreakpointState) => {
      this.isPhone = state.matches;
    });
  }
}
