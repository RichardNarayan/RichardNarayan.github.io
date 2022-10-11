import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserVerificationService } from 'src/app/services/user-verification/user-verification.service';

@Component({
  selector: 'app-user-verification',
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.scss'],
})
export class UserVerificationComponent implements OnInit {
  verificationSelectionType = '';
  verificationMessage = '';

  constructor(
    private userVerificationService: UserVerificationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  verifyByValue() {
    let urlParam =
      this.verificationSelectionType == 'questions'
        ? 'user-questions-validation'
        : 'user-code-validation';
    if (
      this.verificationSelectionType &&
      this.verificationSelectionType == 'questions'
    ) {
      this.userVerificationService.fetchSecurityQuestion().subscribe(
        (response) => {
          this.userVerificationService.setSecurityQuestions(response);
          this.router.navigate([`${urlParam}`]);
        },
        (error) => {
          this.verificationMessage = 'Unsuccessful fetch of security questions';
        }
      );
    } else {
      this.userVerificationService.sendVerificationCode().subscribe(
        (response) => {},
        (error) => {
          if (error.status == 202 || error.status == 200) {
            this.router.navigate([`${urlParam}`]);
          } else {
            this.verificationMessage = 'Unable to validate entries';
          }
        }
      );
    }
  }
}
