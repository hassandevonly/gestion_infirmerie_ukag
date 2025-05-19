import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowConsultationComponent } from './show-consultation.component';

describe('ShowConsultationComponent', () => {
  let component: ShowConsultationComponent;
  let fixture: ComponentFixture<ShowConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowConsultationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
