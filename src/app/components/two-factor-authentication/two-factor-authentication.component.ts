import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { TwoFactorAuthService } from 'src/app/services/two-factor-auth/two-factor-auth.service';
import { UserAuthService } from 'src/app/services/user-auth/user-auth.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-two-factor-authentication',
  templateUrl: './two-factor-authentication.component.html',
  styleUrls: ['./two-factor-authentication.component.scss'],
})
export class TwoFactorAuthenticationComponent implements OnInit {
  twoFactorAuthenticationForm: FormGroup;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  submitted = false;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];
  selectedCountryISO;
  questions = [
    { id: 'QUEST_1', value: 'What is your dream job?' },
    { id: 'QUEST_2', value: 'What primary school did you attend?' },
    {
      id: 'QUEST_3',
      value:
        'What was the house number and street name you lived in as a child?',
    },
    {
      id: 'QUEST_4',
      value: 'In what town or city did your mother and father meet?',
    },
    {
      id: 'QUEST_5',
      value: "What is your grandmother's (on your mother's side) maiden name?",
    },
  ];
  patchServiceCall = false;
  errorMessage;
  updatedFormValues = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: UserAuthService,
    private utilityService: UtilityService,
    private twoFactorService: TwoFactorAuthService
  ) {}

  get firstAnswer() {
    return this.twoFactorAuthenticationForm.get('firstAnswer');
  }
  get secondAnswer() {
    return this.twoFactorAuthenticationForm.get('secondAnswer');
  }
  get phoneNumber() {
    return this.twoFactorAuthenticationForm.get('phoneNumber');
  }
  get firstQuestion() {
    return this.twoFactorAuthenticationForm.get('firstQuestion');
  }
  get secondQuestion() {
    return this.twoFactorAuthenticationForm.get('secondQuestion');
  }
  verficationType;
  ngOnInit(): void {
    this.intializeForm();
  }

  intializeForm() {
    this.twoFactorAuthenticationForm = this.formBuilder.group({
      phoneNumber: ['', Validators.required],
      firstQuestion: ['', Validators.required],
      secondQuestion: ['', Validators.required],
      firstAnswer: ['', Validators.required],
      secondAnswer: ['', Validators.required],
    });
    this.getFormData();
  }

  getFormData() {
    this.twoFactorService.getTwoFactorAuthDetails().subscribe((res) => {
      if (res.userData?.secondFactor) {
        this.firstAnswer.setValue(res?.userData?.firstAnswer);
        this.secondAnswer.setValue(res?.userData?.secondAnswer);
        // using the google phone number library to get country code(countryISO)
        // from the phone number provided
        const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
        let fullNumber =
          res?.userData?.countryCode + res?.userData?.phoneNumber;
        const phoneNumber = phoneUtil.parseAndKeepRawInput(fullNumber);
        const phone = {
          number: res?.userData?.phoneNumber,
          countryCode: phoneUtil.getRegionCodeForNumber(phoneNumber),
          dialCode: res?.userData?.countryCode,
        };
        this.phoneNumber.setValue(phone);
        this.firstQuestion.setValue(res?.userData?.firstQuestion);
        this.secondQuestion.setValue(res?.userData?.secondQuestion);
        this.patchServiceCall = true;
      } else {
        this.patchServiceCall = false;
      }
    });
  }

  onSubmit() {
    if (!this.authService.isSessionExpired) {
      this.utilityService.showSuccessMessageOpenSnackBar(
        'Session has expired.',
        'Close'
      );
      return;
    }
    this.submitted = true;
    if (this.twoFactorAuthenticationForm.invalid) {
      return;
    }
    let body = {
      countryCode: this.twoFactorAuthenticationForm.value['phoneNumber']
        .dialCode,
      phoneNumber: this.twoFactorAuthenticationForm.value['phoneNumber'].number,
      firstQuestion: this.twoFactorAuthenticationForm.value['firstQuestion'],
      firstAnswer: this.twoFactorAuthenticationForm.value['firstAnswer'],
      secondQuestion: this.twoFactorAuthenticationForm.value['secondQuestion'],
      secondAnswer: this.twoFactorAuthenticationForm.value['secondAnswer'],
      secondFactor: true,
    };
    if (this.patchServiceCall) {
      this.twoFactorAuthenticationForm['_forEachChild']((control, name) => {
        if (control.dirty) {
          this.checkFormFieldChange(name, control);
        }
      });
      this.updatedFormValues = {
        ...this.updatedFormValues,
        ...{ secondFactor: true },
      };
      this.twoFactorService
        .patchTwoFactorAuthDetails(this.updatedFormValues)
        .subscribe(
          (res) => {
            //message to show that the values were updated
            this.utilityService.showSuccessMessageOpenSnackBar(
              'Your details were updated.',
              'Close'
            );
          },
          (error) => {
            this.errorMessage == error.error.message;
          }
        );
    } else {
      this.twoFactorService.updateTwoFactorAuthDetails(body).subscribe(
        (res) => {
          this.utilityService.showSuccessMessageOpenSnackBar(
            'Two factor authentication is enabled.',
            'Close'
          );
        },
        (error) => {
          // to show the error message sent from backend from error part
          this.errorMessage == error.error.message;
        }
      );
    }
  }

  checkFormFieldChange(name, control) {
    if (name == 'phoneNumber') {
      this.updatedFormValues = {
        ...this.updatedFormValues,
        ...{
          countryCode: this.twoFactorAuthenticationForm.value['phoneNumber']
            .dialCode,
          phoneNumber: this.twoFactorAuthenticationForm.value['phoneNumber']
            .number,
        },
      };
    } else {
      this.updatedFormValues[name] = control.value;
    }
  }
}
