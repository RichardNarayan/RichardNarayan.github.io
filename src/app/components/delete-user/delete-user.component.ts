import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserInternalService } from 'src/app/services/user-internal/user-internal.service';
import { RegexConst } from 'src/app/shared/constants/regex-constants';
import { CustomValidator } from 'src/app/shared/validators/custom-validator';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent implements OnInit {

  form : FormGroup;
  submitted:boolean = false;

  get email() {
    return this.form.get('email');
  }
  get invalidEmail() {
    return !this.form.controls['email'].hasError('invalidEmail');
  }

  emailInputText;

  constructor(private usersService: UserInternalService,
    private formBuilder:FormBuilder) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email:['', [Validators.required, CustomValidator.emailValidator(RegexConst.email,{invalidEmail:true})]]
    })
  }

  successMessage:boolean;
  errorMessage = '';
  deleteUser() {
    this.successMessage = false;
    this.errorMessage = '';
    this.usersService.deleteUser(this.form.value['email']).subscribe(
      () => {
          this.successMessage = true;
      },
      (error) => {
        console.log(error.error.message);
        
        this.errorMessage= error.message;
        this.errorMessage = error.error.message;
      }
    );
  }

}
