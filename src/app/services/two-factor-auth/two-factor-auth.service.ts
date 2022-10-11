import { Injectable } from '@angular/core';
import { HttpClientService } from 'src/app/shared/http-client/http-client.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorAuthService {
  private secondFactorUrl: string =
    environment.authServiceUrl + '/v1/second-factor';

  constructor(private httpClient: HttpClientService) {}

  getTwoFactorAuthDetails() {
    return this.httpClient.get(this.secondFactorUrl);
  }

  updateTwoFactorAuthDetails(body) {
    return this.httpClient.post(this.secondFactorUrl, body);
  }

  patchTwoFactorAuthDetails(body) {
    return this.httpClient.patch(this.secondFactorUrl, body);
  }
}
