import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserVerificationService {
  private umgTokenReconcileData$: Observable<any>;
  private securityQuestions$: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  fetchSecurityQuestion() {
    return this.http.get(`${environment.sparkUrl}question/challenge`, {
      withCredentials: true,
    });
  }

  setSecurityQuestions(questions) {
    this.securityQuestions$.next(questions);
  }

  getSecurityQuestions(): Observable<any> {
    if (!this.securityQuestions$) {
      this.fetchSecurityQuestion().subscribe((data) =>
        this.setSecurityQuestions(data)
      );
    }
    return this.securityQuestions$.asObservable();
  }

  submitSecurityAnswers(encodedAnswers): any {
    let requestOptions: any = {
      withCredentials: true,
    };

    const params = new HttpParams().set('answers', encodedAnswers);

    requestOptions.params = params;

    return this.http.post<any>(
      environment.sparkUrl + 'questions/validation',
      null,
      {
        withCredentials: true,
        params,
      }
    );
  }

  checkVerificationCode(code): any {
    let requestOptions: any = {
      withCredentials: true,
    };
    const params = new HttpParams().set('code', code);
    requestOptions.params = params;

    return this.http.post<any>(
      environment.sparkUrl + 'validate/challenge',
      null,
      requestOptions
    );
  }

  sendVerificationCode(): any {
    let url = environment.sparkUrl + 'create/challenge';
    return this.http.post<any>(url, null, { withCredentials: true });
  }

  umgTokenReconcileAndGetMSIToken(code, providerId, userState) {
    var url =
      `${environment.sparkUrl}umgtoken/reconcile` +
      '?code=' +
      code +
      '&providerid=' +
      providerId;
    // when it has "userState" equal to authenticated, it is disneyAnimation user
    if (userState) {
      url = url + '&org_name=DisneyAnimation';
    }
    if (!this.umgTokenReconcileData$) {
      this.umgTokenReconcileData$ = this.http
        .post<any>(url, null, { withCredentials: true })
        .pipe(shareReplay(1));
    }
    return this.umgTokenReconcileData$;
  }
}
