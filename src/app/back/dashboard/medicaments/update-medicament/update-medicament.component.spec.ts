import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMedicamentComponent } from './update-medicament.component';

describe('UpdateMedicamentComponent', () => {
  let component: UpdateMedicamentComponent;
  let fixture: ComponentFixture<UpdateMedicamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateMedicamentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateMedicamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
