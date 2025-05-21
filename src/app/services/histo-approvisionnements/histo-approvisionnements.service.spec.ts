import { TestBed } from '@angular/core/testing';

import { HistoApprovisionnementsService } from './histo-approvisionnements.service';

describe('HistoApprovisionnementsService', () => {
  let service: HistoApprovisionnementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoApprovisionnementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
