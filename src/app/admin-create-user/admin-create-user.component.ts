import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserInternalService } from '../services/user-internal/user-internal.service';
import { RegexConst } from '../shared/constants/regex-constants';
import { CustomValidator } from '../shared/validators/custom-validator';

@Component({
  selector: 'app-admin-create-user',
  templateUrl: './admin-create-user.component.html',
  styleUrls: ['./admin-create-user.component.scss']
})
export class AdminCreateUserComponent implements OnInit {

  form : FormGroup;
  submitted:boolean = false;
  setDomain:boolean;

  get email() {
    return this.form.get('email');
  }
  get displayName() {
    return this.form.get('displayName');
  }
  get domain() {
    return this.form.get('domain');
  }
  get invalidEmail() {
    return !this.form.controls['email'].hasError('invalidEmail');
  }
  
  constructor(private formBuilder: FormBuilder,
    private usersService: UserInternalService) { }

  ngOnInit(): void {
    this.setDomain = true;
    this.form = this.formBuilder.group({
      email:['', [Validators.required, CustomValidator.emailValidator(RegexConst.email,{invalidEmail:true})]],
      displayName:[''],
      domain: ['']
    });
    this.domain.setValue("MSI");
  }

  successMessage:boolean;
  errorMessage='';

  createUser(){
    this.submitted = true;
    let displayName = this.form.value['displayName'];
    displayName.trim();
    if(displayName == ' '){
      this.displayName.reset();
    } 
    if(this.form.invalid){
      return;
    }
    this.successMessage= false;
    this.errorMessage = '';
    let body;
    if(this.setDomain){
      body={
        email: this.form.value['email'],
        displayName: this.form.value['displayName'],
        domain: this.form.value['domain']
      }
    }else{
      body={
        email: this.form.value['email'],
        displayName: this.form.value['displayName']
      }
    }
    this.usersService.createAdminUser(body).subscribe(res=>{     
      this.successMessage = true;    
    },
    (error) => {   
      this.errorMessage = error.error.message;
    })
  }

}
