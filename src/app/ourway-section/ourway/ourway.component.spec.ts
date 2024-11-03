import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurwayComponent } from './ourway.component';

describe('OurwayComponent', () => {
  let component: OurwayComponent;
  let fixture: ComponentFixture<OurwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurwayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
