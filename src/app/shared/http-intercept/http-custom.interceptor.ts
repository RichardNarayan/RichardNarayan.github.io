import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAuthService } from 'src/app/services/user-auth/user-auth.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs/internal/observable/throwError';
import { environment } from 'src/environments/environment';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Base64 } from 'js-base64';

@Injectable()
export class HttpCustomInterceptor implements HttpInterceptor {
  private tokenRefreshed = false;
  private tokenRefreshTask: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    public userAuthService: UserAuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // return next.handle(request);
    request = this.addBearerTokenIfNeeded(
      request,
      this.userAuthService.getJwtToken()
    );

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addBearerTokenIfNeeded(request: HttpRequest<any>, token: string) {
    if (this.skipBearerToken(request)) {
      return request;
    }
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    /**
     * If 401 error is from token endpoint, do not retry but go to login page
     */
    if (this.isTokenEndpoint(request) && !this.router.url.includes('/login')) {
      this.router.navigate(['login'], {
        queryParams: { returnUrl: this.router.routerState.snapshot.url },
      });
      return next.handle(null);
    }
    if (!this.tokenRefreshed) {
      this.tokenRefreshed = true;
      this.tokenRefreshTask.next(null);

      return this.userAuthService.refreshBearerToken().pipe(
        switchMap((token: any) => {
          this.tokenRefreshed = false;
          this.tokenRefreshTask.next(token.jwt);
          return next.handle(this.addBearerTokenIfNeeded(request, token.jwt));
        })
      );
    } else {
      return this.tokenRefreshTask.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          return next.handle(this.addBearerTokenIfNeeded(request, jwt));
        })
      );
    }
  }

  private skipBearerToken(request: HttpRequest<any>) {
    /**
     * if it is neither locker-api call nor spark call skip bearer token
     */
    if (
      !request.url.startsWith(`${environment.ioRsUrl}`) &&
      !request.url.startsWith(`${environment.sparkUrl}`) &&
      !request.url.startsWith(`${environment.lockerApiUrl}`) &&
      !request.url.startsWith(`${environment.landingServiceUrl}`) &&
      !request.url.startsWith(`${environment.authServiceUrl}`)
    ) {
      return true;
    }
    /**
     * if it is spark token call, bearer token is not required
     * if it is MultiFactor End Point, bearer token is not required
     * if it is verification token end Point, bearer token is not required
     */
    if (
      this.isTokenEndpoint(request) ||
      this.isDisableMultifactorEndPoint(request) ||
      this.isVerifyTokenEndPoint(request)
    ) {
      return true;
    }
    /**
     * all other case return false
     */
    return false;
  }

  private isTokenEndpoint(request: HttpRequest<any>) {
    return (
      request.url === `${environment.sparkUrl}tokens` ||
      request.url.startsWith(`${environment.sparkUrl}umgtoken/reconcile`)
    );
  }
  private isVerifyTokenEndPoint(request: HttpRequest<any>) {
    return request.url.includes(`${environment.sparkUrl}verifytoken`);
  }
  private isDisableMultifactorEndPoint(request: HttpRequest<any>) {
    return (
      request.url ===
      `${environment.sparkUrl}multifactor?${Base64.encode('disable')}`
    );
  }
}
