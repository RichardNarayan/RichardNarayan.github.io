import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpCustomInterceptor } from '../shared/http-intercept/http-custom.interceptor';

@NgModule({
  declarations: [],

  providers: [
    AuthGuard,
    LoginGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpCustomInterceptor,
      multi: true,
    },
  ],

  imports: [CommonModule, HttpClientModule],
})
export class AuthModule {}
