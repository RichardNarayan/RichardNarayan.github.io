import { TestBed } from '@angular/core/testing';

import { UserInternalService } from './user-internal.service';

describe('UserInternalService', () => {
  let service: UserInternalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserInternalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
