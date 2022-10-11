import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { UrlTree, CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthService } from 'src/app/services/user-auth/user-auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanLoad {
  constructor(
    private userAuthService: UserAuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (!this.userAuthService.isLoggedIn()) {
      this.router.navigate(['login']);
    }
    return this.userAuthService.isLoggedIn();
  }
}
