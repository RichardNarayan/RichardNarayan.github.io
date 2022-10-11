import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthService } from 'src/app/services/user-auth/user-auth.service';
import { TWO_FACTOR_EDIT_LOGIN_PATH } from 'src/app/shared/constants/common';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorAuthenticaionGuard implements CanActivate {
  constructor(
    private userAuthService: UserAuthService,
    private router: Router,

    @Inject(DOCUMENT) private document: Document
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.userAuthService.isSessionExpired()) {
      return true;
    } else {
      return this.router.parseUrl(TWO_FACTOR_EDIT_LOGIN_PATH);
    }
  }
}
