import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/login.service';
import { UserAuthService } from 'src/app/services/user-auth/user-auth.service';
import { UserVerificationService } from 'src/app/services/user-verification/user-verification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  emailAddress = false;
  normalLogin = true;
  currentToken = '';
  currentUser: any = {};
  authMessage = '';
  creds = {
    email: '',
    pswd: '',
    inputLabel: 'Email address',
    title: 'Sign In',
  };

  loginEmailError = 'Email address is incorrect. Please try again.';
  loginError = 'Your email/password is incorrect. Please try again.';
  recoverError = 'Email address is required to recover the password.';

  showPassword = false;

  constructor(
    private loginService: LoginService,
    private authService: UserAuthService,
    private userVerificationService: UserVerificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if login page has came from ADFS users
    this.verifyADFSUser();
  }

  verifyADFSUser() {
    let ADFSUrl = window.location.href;
    var ADFSUrlArray = ADFSUrl.split('#')[0].split('?');

    if (ADFSUrlArray.length > 1) {
      var codefromADFS, paramArr, codeVal, stateVal, userState;

      //check if url included &code
      codefromADFS = ADFSUrlArray.includes('&code=')
        ? ADFSUrlArray[1].split('&code=')
        : ADFSUrlArray[1].split('code=');

      if (codefromADFS.length > 1) {
        if (codefromADFS[1].includes('&state=')) {
          paramArr = codefromADFS[1].split('&state=');
          if (paramArr.length > 1) {
            codeVal = paramArr[0];
            stateVal = paramArr[1];
          }
        } else {
          codeVal = codefromADFS[1];
          var tempArr = codefromADFS[0].split('state=');
          if (tempArr.length > 1) {
            stateVal = tempArr[1];
          }
        }
      }
      if (stateVal.includes('&')) {
        var stateValArr = stateVal.split('&');
        stateVal = stateValArr[0];
        userState =
          stateValArr[1].replace('userState=', '') === 'Authenticated';
      }

      if (codeVal.includes('&')) {
        var codeValArr = codeVal.split('&');
        codeVal = codeValArr[0];
      }
      // get the token from UMG and reconcile to get out token
      if (codeVal && stateVal) {
        this.normalLogin = false; //this shows please wait message until we receive token from UMG

        this.userVerificationService
          .umgTokenReconcileAndGetMSIToken(codeVal, stateVal, userState)
          .subscribe(
            (response) => {
              this.authService.storeJwtToken(response.token);
              let decodedToken = this.authService.decodeToken(response.token);
              if (decodedToken && decodedToken.vfy === true) {
                this.router.navigate(['home']);
              }
            },
            (error) => {
              window.alert(JSON.stringify(error.error));
              console.error('error while validating the authentication code',error);
            }
          );
      }
    }
  }

  userLogin(creds) {
    this.authMessage = '';
    const emailRegex = new RegExp(
      '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$'
    );
    if (!creds.email || !emailRegex.test(creds.email)) {
      this.authMessage = this.loginEmailError;
    } else if (creds.email && !creds.pswd) {
      this.loginService.domainLookupInPassport(creds.email).subscribe(
        (response) => {
          if (response) {
            //redirect to UMG ADFS page
            var redirectUrl = this.loginService.getAuthorizationEndpoint(
              response
            );
            if (redirectUrl) {
              window.open(redirectUrl, '_self');
            }
          } else {
            //show password entry section
            this.enterPassword(creds);
          }
        },
        (error) => {
          //rejection -> this means passport lookup does not allow this domain for adfs login
          this.enterPassword(creds);
        }
      );
    } else {
      this.emailAddress = true;
      /*Auth user with acct/pwd*/
      this.loginService.userAuthentication(creds.email, creds.pswd).subscribe(
        (data: any) => {
          this.authService.storeJwtToken(data.token);
          this.authMessage = '';
          let decodedToken = this.authService.decodeToken(data.token);
          if (decodedToken && decodedToken.vfy === true) {
            this.router.navigate(['user-verification']);
          } else {
            this.router.navigate(['home']);
          }
        },
        (error) => {
          this.emailAddress = false;
          this.creds.title = 'Sign in';
          this.creds.inputLabel = 'Email address';
          this.creds.email = '';
          this.creds.pswd = '';
          this.authMessage = this.loginError;
        }
      );
    }
  }

  enterPassword(creds) {
    this.emailAddress = true;
    if (!creds.pswd) {
      creds.title = 'Welcome';
      creds.inputLabel = 'Enter password';
      this.authMessage = '';
    }
  }
}
