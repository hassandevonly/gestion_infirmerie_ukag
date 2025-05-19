import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMedicamentsComponent } from './detail-medicaments.component';

describe('DetailMedicamentsComponent', () => {
  let component: DetailMedicamentsComponent;
  let fixture: ComponentFixture<DetailMedicamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailMedicamentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailMedicamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
