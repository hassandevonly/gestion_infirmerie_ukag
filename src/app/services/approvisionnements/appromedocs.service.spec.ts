import { TestBed } from '@angular/core/testing';

import { AppromedocsService } from './appromedocs.service';

describe('AppromedocsService', () => {
  let service: AppromedocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppromedocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
