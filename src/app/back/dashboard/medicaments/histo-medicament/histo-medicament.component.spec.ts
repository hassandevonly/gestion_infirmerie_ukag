import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoMedicamentComponent } from './histo-medicament.component';

describe('HistoMedicamentComponent', () => {
  let component: HistoMedicamentComponent;
  let fixture: ComponentFixture<HistoMedicamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoMedicamentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoMedicamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
