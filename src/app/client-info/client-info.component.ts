import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-client-info',
  standalone: true,
  imports: [],
  templateUrl: './client-info.component.html',
  styleUrl: './client-info.component.scss'
})
export class ClientInfoComponent implements OnInit {
  companyDate = new Date('2022-10-14');
  diffInDays!: number;

  ngOnInit(): void {
      const diffInMs = new Date().getTime() - this.companyDate.getTime();
      this.diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

}
