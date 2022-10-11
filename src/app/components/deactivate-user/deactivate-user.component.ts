import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserInternalService } from 'src/app/services/user-internal/user-internal.service';
import { RegexConst } from 'src/app/shared/constants/regex-constants';
import { CustomValidator } from 'src/app/shared/validators/custom-validator';

@Component({
  selector: 'app-deactivate-user',
  templateUrl: './deactivate-user.component.html',
  styleUrls: ['./deactivate-user.component.scss']
})
export class DeactivateUserComponent implements OnInit {

  form : FormGroup;
  submitted:boolean = false;

  get email() {
    return this.form.get('email');
  }
  get invalidEmail() {
    return !this.form.controls['email'].hasError('invalidEmail');
  }

  constructor(private usersService: UserInternalService,
    private formBuilder:FormBuilder) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email:['', [Validators.required, CustomValidator.emailValidator(RegexConst.email,{invalidEmail:true})]]
    })
  }

  successMessage:boolean;
  errorMessage;
  deactivateEmail() {
    if(this.form.invalid){
      return;
    } 
    // removing all previous messages
    this.successMessage = false;
    this.errorMessage= '';
    this.activateSuccessMessage = false;
    this.activateErrorMessage= '';
      this.usersService.deactivateUser(this.form.value['email']).subscribe(
        (res) => {
          if (res) {
            this.successMessage = true;
          }
        },
        (error) => { 
          this.errorMessage = error.error.message;
        }
      );    
  }
  activateSuccessMessage:boolean;
  activateErrorMessage;
  activateEmail(){
    if(this.form.invalid){
      return;
    }
    // removing all previous messages 
    this.successMessage = false;
    this.errorMessage= '';
    this.activateSuccessMessage = false;
    this.activateErrorMessage= '';
      this.usersService.activateUser(this.form.value['email']).subscribe(
        (res) => {
          if (res) {
            this.activateSuccessMessage = true;
          }
        },
        (error) => { 
          this.activateErrorMessage = error.error.message;
        }
      );
  }
}
