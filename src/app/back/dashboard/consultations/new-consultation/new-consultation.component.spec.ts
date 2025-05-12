import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewConsultationComponent } from './new-consultation.component';

describe('NewConsultationComponent', () => {
  let component: NewConsultationComponent;
  let fixture: ComponentFixture<NewConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewConsultationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
