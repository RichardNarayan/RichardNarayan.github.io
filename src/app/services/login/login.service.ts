import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Base64 } from 'js-base64';
import { HttpClientService } from 'src/app/shared/http-client/http-client.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  token = '';

  constructor(
    private httpClient: HttpClientService,
    private http: HttpClient
  ) {}

  domainLookupInPassport(domainOrEmail): any {
    return this.httpClient.get(
      'https://msi.fusionauth.io/api/identity-provider/lookup?domain=' +
        domainOrEmail
    );
  }

  getAuthorizationEndpoint(jsonObj) {
    if (
      jsonObj.identityProvider &&
      jsonObj.identityProvider.oauth2 &&
      jsonObj.identityProvider.oauth2.authorization_endpoint
    ) {
      return jsonObj.identityProvider.oauth2.authorization_endpoint;
    } else if (
      jsonObj.identityProvider &&
      jsonObj.identityProvider.type === 'SAMLv2'
    ) {
      let client_id = jsonObj.identityProvider.applicationIds[0];
      let idp = jsonObj.identityProvider.id;
      let orgName = jsonObj.identityProvider.name;
      //redired url cannot be configured environment wise
      const REDIRECT_URL = 'https://app.studiocdn.com';

      let url =
        'https://msi.fusionauth.io/oauth2/authorize?client_id=' +
        client_id +
        '&response_type=code&redirect_uri=' +
        REDIRECT_URL +
        '&idp_hint=' +
        idp +
        '&state=' +
        idp +
        '&name=' +
        orgName;
      return url;
    } else {
      return null;
    }
  }

  userAuthentication(acct, pwd) {
    let requestOptions: any = {
      withCredentials: true,
    };

    const headers = new HttpHeaders().set(
      'Authorization',
      'Basic ' + Base64.encode(acct + ':' + pwd)
    );

    /*
     * Note: If acct & pwd are not provided then Sparks relies on stored cookie to authenticate user.  See Sparks AuthenticationFilter.java
     * for more details.
     */
    if (acct && pwd) {
      requestOptions.headers = headers;
    }
    return this.http.post(
      `${environment.sparkUrl}tokens`,
      null,
      requestOptions
    );
  }

  recoverPassword(email) {
    return this.http.post(
      `${environment.sparkUrl}recoverp?email=${email}`,
      null
    );
  }
}
