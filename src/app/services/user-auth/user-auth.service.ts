import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Base64 } from 'js-base64';
import {
  EXPIRATION_MINUTES,
  EXPIRATION_TIME,
} from 'src/app/shared/constants/common';

export class TokenDetail {
  token: string;
}
interface MSIToken {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  vfy: boolean;
  rdy: boolean;
  dom: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private sparkUrl: string = environment.sparkUrl;
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  public loggedInUser: string;

  constructor(private http: HttpClient) {}

  loadTokenFirst(): Promise<any> {
    let requestOptions = {
      withCredentials: true,
    };
    const promise = this.http
      .post<any>(`${this.sparkUrl}tokens`, null, requestOptions)
      .toPromise()
      .then((data) => {
        this.doLoginUser(data);
        return data;
      })
      .catch((err) => {
        return err;
      });
    return promise;
  }

  // this function checks if the session has expired for two factor authentication page
  isSessionExpired() {
    if (!this.getExpirationTime()) {
      return false;
    }
    if (Date.now().valueOf() > Number(this.getExpirationTime())) {
      this.removeExpirationTime();
      return false;
    }
    return true;
  }

  // set session expiry time for second factor authentication page in session storage
  setExpirationTime() {
    sessionStorage.setItem(
      EXPIRATION_TIME,
      JSON.stringify(Date.now().valueOf() + EXPIRATION_MINUTES)
    );
  }

  // get the session expiry time for second factor authentication page from session storage
  getExpirationTime() {
    return sessionStorage.getItem(EXPIRATION_TIME);
  }

  // remove the session expiry time for second factor authentication page from session storage
  removeExpirationTime() {
    sessionStorage.removeItem(EXPIRATION_TIME);
  }

  logout() {
    return this.http
      .post<any>(`${this.sparkUrl}logout`, null, { withCredentials: true })
      .pipe(
        tap(() => this.doLogoutUser()),
        mapTo(true),
        catchError((error) => {
          alert(error.error);
          return of(false);
        })
      );
  }

  refreshBearerToken() {
    let requestOptions = {
      withCredentials: true,
    };
    return this.http
      .post<any>(`${this.sparkUrl}tokens`, null, requestOptions)
      .pipe(
        tap((tokenDetail: TokenDetail) => {
          this.storeTokens(tokenDetail);
        })
      );
  }

  isLoggedIn() {
    return this.isTokenAlive() && !this.secondFactorRequired();
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  secondFactorRequired() {
    let token = localStorage.getItem(this.JWT_TOKEN);
    let decodedToken = jwt_decode<MSIToken>(token);
    return (
      decodedToken && decodedToken.vfy && !this.isUmgUser(decodedToken.sub)
    );
  }

  private isUmgUser(email: String) {
    let domain = email.replace(/.*@/, '');
    return domain === 'umusic.com';
  }

  private doLoginUser(tokenDetail: TokenDetail) {
    let decodedToken = jwt_decode<MSIToken>(tokenDetail.token);

    this.loggedInUser = decodedToken.sub;
    this.storeTokens(tokenDetail);
  }

  private doLogoutUser() {
    this.loggedInUser = null;
    this.removeTokens();
  }

  storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
  }

  private storeTokens(tokenDetail: TokenDetail) {
    localStorage.setItem(this.JWT_TOKEN, tokenDetail.token);
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
  }

  isTokenAlive = () => {
    try {
      const token = localStorage.getItem('JWT_TOKEN');
      const decoded = jwt_decode<MSIToken>(token);
      const now = Date.now().valueOf() / 1000;
      if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
        throw new Error(`token expired: ${JSON.stringify(decoded)}`);
      }
      if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
        throw new Error(`token not yet valid: ${JSON.stringify(decoded)}`);
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  checkEmailDomain(email) {
    return this.http.get(
      'https://msi.fusionauth.io/api/identity-provider/lookup?domain=' + email
    );
  }

  passwordRecoveryEmail(email) {
    return this.http.post(`${this.sparkUrl}recoverp?email=${email}`, null);
  }

  getQuestion() {
    // val config =  CookieAuthenticatorSettings(secureCookie=false);
    return this.http.get(`${this.sparkUrl}question/challenge`, {
      withCredentials: true,
    });
  }

  validateAnswers(answers) {
    return this.http.post(
      `${this.sparkUrl}questions/validation?answers=` + answers,
      null,
      { withCredentials: true }
    );
  }

  requestVerificationCode() {
    return this.http.post(`${this.sparkUrl}create/challenge`, null, {
      withCredentials: true,
    });
  }

  validateVerificationCode(code) {
    return this.http.post(
      `${this.sparkUrl}validate/challenge?code=` + code,
      null,
      { withCredentials: true }
    );
  }

  getLoggedInUser() {
    if (this.loggedInUser) {
      return this.loggedInUser;
    }
    let token = localStorage.getItem(this.JWT_TOKEN);
    if (token) {
      let decodedToken = jwt_decode<MSIToken>(token);
      this.loggedInUser = decodedToken.sub;
      return this.loggedInUser;
    }
  }

  hasUserWriteAccess() {
    let token = localStorage.getItem(this.JWT_TOKEN);
    if (token) {
      let decodedToken = jwt_decode<MSIToken>(token);
      return !decodedToken.rdy;
    }
    return false;
  }

  isMsiDomainUser() {
    let token = localStorage.getItem(this.JWT_TOKEN);
    if (token) {
      let decodedToken = jwt_decode<MSIToken>(token);
      if (decodedToken.dom === 'msi:domain:msi') {
        return true;
      }
    }
    return false;
  }

  getDomain() {
    let ptoken, dmain;
    let token = localStorage.getItem(this.JWT_TOKEN);
    if (token) {
      ptoken = jwt_decode<MSIToken>(token);
      if (ptoken && ptoken.dom) {
        dmain = ptoken.dom;
      }
    }
    return dmain;
  }

  createUserProfile() {
    return this.http.post(`${environment.ioRsUrl}users`, null);
  }

  decodeToken(token) {
    if (token) {
      let decodedToken = jwt_decode<MSIToken>(token);
      return decodedToken;
    }
  }
}
