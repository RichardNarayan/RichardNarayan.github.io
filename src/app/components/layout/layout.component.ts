import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthService } from 'src/app/services/user-auth/user-auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  username: String;
  constructor( private authService: UserAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.username = this.extractDisplayName(
      this.authService.getLoggedInUser()
    );
  }

  logoutUser(): void {
    this.authService.logout().subscribe((response) => {
      // for adfs user,remove the query param while logging out to prevent redirecting  back to package/all page
      let ADFSUrl = window.location.href;
      let ADFSUrlArray = ADFSUrl.split('#')[0].split('?');
      if (ADFSUrlArray.length > 1) {
        window.location.href = ADFSUrlArray[0] + '#/login';
      } else {
        this.router.navigate(['login']);
      }
    });
  }

    /*
  Extracts display name. For example, Test is extracted from Test<test@email.com>
  */
  extractDisplayName(mailbox: String): String {
    if (mailbox?.indexOf('>') > 0 && mailbox?.indexOf('<') > 0) {
      return mailbox.substring(0, mailbox.indexOf('<'));
    }
    return mailbox;
  }


}
