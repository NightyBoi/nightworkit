import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurwaySectionComponent } from './ourway-section.component';

describe('OurwaySectionComponent', () => {
  let component: OurwaySectionComponent;
  let fixture: ComponentFixture<OurwaySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurwaySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurwaySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
