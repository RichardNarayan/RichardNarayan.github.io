import { TestBed } from '@angular/core/testing';

import { UserVerificationService } from './user-verification.service';

describe('UserVerificationService', () => {
  let service: UserVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
