import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from './components/layout/layout.component';
import { DeactivateUserComponent } from './components/deactivate-user/deactivate-user.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckUserComponent } from './components/check-user/check-user.component';
import { LoginComponent } from './components/login/login.component';
import { AuthModule } from './auth/auth.module';
import { UserVerificationComponent } from './components/user-verification/user-verification.component';
import { TwoFactorAuthenticationComponent } from './components/two-factor-authentication/two-factor-authentication.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DeactivateUserComponent,
    DeleteUserComponent,
    AdminCreateUserComponent,
    HomeComponent,
    CheckUserComponent,
    LoginComponent,
    UserVerificationComponent,
    TwoFactorAuthenticationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AuthModule,
    MatSnackBarModule,
    NgxIntlTelInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
