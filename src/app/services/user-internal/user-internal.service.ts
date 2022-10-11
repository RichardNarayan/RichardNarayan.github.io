import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class UserInternalService {
  private adminUsersUrl: string =
    environment.authServiceUrl + '/v1/admin/users';
  constructor(private httpClient: HttpClientService) { }

  createAdminUser(body) {
    return this.httpClient.post(this.adminUsersUrl, body);
  }

  deleteUser(email) {
    return this.httpClient.delete(
      this.adminUsersUrl,
      email
    );
  }

  deactivateUser(email) {
    return this.httpClient.put(
      this.adminUsersUrl + "/" + email + '?operation=deactivate',
      null
    );
  }

  activateUser(email) {
    return this.httpClient.put(
      this.adminUsersUrl + "/" + email + '?operation=activate',
      null
    );
  }
}
