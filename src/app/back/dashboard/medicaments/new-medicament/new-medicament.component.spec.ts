import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMedicamentComponent } from './new-medicament.component';

describe('NewMedicamentComponent', () => {
  let component: NewMedicamentComponent;
  let fixture: ComponentFixture<NewMedicamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewMedicamentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMedicamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
