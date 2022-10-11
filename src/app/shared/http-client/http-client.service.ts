import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoaderService } from '../loader-service/loader.service';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  constructor(private http: HttpClient, private loaderService: LoaderService) {}

  request(
    method: string,
    url: string,
    body?: any,
    params?: HttpParams | { [param: string]: string | string[] },
    header?: HttpHeaders
  ): Observable<any> {
    const headers = header
      ? header
      : new HttpHeaders({
          'Content-Type': 'application/json',
        });
    //  We'll show the loader here!!
    this.showLoader();
    return this.http
      .request(method, url, { body: body, headers: headers, params: params })
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this.hideLoader();
        })
      );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  get(
    url: string,
    header?: HttpHeaders,
    params?: HttpParams | { [param: string]: string | string[] }
  ): Observable<any> {
    return this.request('GET', url, null, params, header);
  }

  post(
    url: string,
    body: any | null,
    header?: HttpHeaders,
    params?: HttpParams | { [param: string]: string | string[] }
  ): Observable<any> {
    return this.request('POST', url, body, params, header);
  }

  put(
    url: string,
    body: any | null,
    header?: HttpHeaders,
    params?: HttpParams | { [param: string]: string | string[] }
  ): Observable<any> {
    return this.request('PUT', url, body, params, header);
  }

  patch(
    url: string,
    body: any | null,
    header?: HttpHeaders,
    params?: HttpParams | { [param: string]: string | string[] }
  ): Observable<any> {
    return this.request('PATCH', url, body, params, header);
  }

  delete(
    url: string,
    body: any | null,
    header?: HttpHeaders,
    params?: HttpParams | { [param: string]: string | string[] }
  ): Observable<any> {
    return this.request('DELETE', url, body, params, header);
  }

  showLoader() {
    this.loaderService.showLoader();
  }

  hideLoader() {
    this.loaderService.hideLoader();
  }
}