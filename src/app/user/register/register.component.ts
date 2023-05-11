import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private auth: AuthService) { }

  inSubmission = false

  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(120)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
    ]),
    confirm_password: new FormControl('', [
      Validators.required,
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13)
    ]),
  })
  showAlert = false
  alertMsg = "Your account is being created..."
  alertColor = 'blue'

  async register() {
    this.showAlert = true
    this.alertMsg = "Your account is being created..."
    this.alertColor = 'blue'
    this.inSubmission = true

    try {
      this.auth.createUser(this.registerForm.value as IUser)
    } catch (err) {
      console.log(err)
      this.alertMsg = "Error happened while register the account. Please try again"
      this.alertColor = 'red'
      this.inSubmission = false
      return
    }
    this.alertMsg = "Your account has been created!"
    this.alertColor = 'green'

  }
}
