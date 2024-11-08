import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurwayMobileComponent } from './ourway-mobile.component';

describe('OurwayMobileComponent', () => {
  let component: OurwayMobileComponent;
  let fixture: ComponentFixture<OurwayMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurwayMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurwayMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
