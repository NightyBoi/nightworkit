import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

@Component({
  selector: 'app-ourway-mobile',
  standalone: true,
  imports: [],
  templateUrl: './ourway-mobile.component.html',
  styleUrl: './ourway-mobile.component.scss'
})
export class OurwayMobileComponent implements OnInit {

  activeIndex = 0;

  ngOnInit(): void {
    const swiper = new Swiper('.swiper', {
      // Optional parameters
      direction: 'horizontal',
      slidesPerView: 1.3,
      centeredSlides: true,
    
      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
    
    
      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });
    swiper.on('slideChange', (event) => {
      this.activeIndex = event.activeIndex;
    });
  }
}
