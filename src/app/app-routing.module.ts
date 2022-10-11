import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { LoginGuard } from './auth/guards/login.guard';
import { RouteGuard } from './auth/guards/route.guard';
import { TwoFactorAuthenticaionGuard } from './auth/guards/two-factor-authentication.guard';
import { CheckUserComponent } from './components/check-user/check-user.component';
import { DeactivateUserComponent } from './components/deactivate-user/deactivate-user.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { HomeComponent } from './components/home/home.component';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { TwoFactorAuthenticationComponent } from './components/two-factor-authentication/two-factor-authentication.component';
import { UserVerificationComponent } from './components/user-verification/user-verification.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    canActivate: [RouteGuard],
    path: 'user-verification',
    component: UserVerificationComponent,
  },
  {
    path:'', component: LayoutComponent,
    canActivate: [AuthGuard],
    canLoad: [LoginGuard],
    children:[
      {path: '', redirectTo: 'home', pathMatch: 'full' },
      {path:'home', component: HomeComponent},
      {path:'admin-create-user', component: AdminCreateUserComponent},
      {path:'deactivate', component: DeactivateUserComponent},
      {path:'delete', component: DeleteUserComponent},
      {path:'check', component: CheckUserComponent},
      {
        canActivate: [TwoFactorAuthenticaionGuard],
        path: 'two-factor-authentication',
        component: TwoFactorAuthenticationComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
