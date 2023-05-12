import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private auth: AuthService) { }

  credentials = {
    email: '',
    password: ''
  }
  showAlert = false
  alertMsg = "Your account is being created..."
  alertColor = 'blue'
  inSubmission = false

  async login() {
    this.showAlert = true
    this.alertMsg = "Logging in..."
    this.alertColor = 'blue'
    this.inSubmission = true
    try {
      await this.auth.signIn(this.credentials.email, this.credentials.password)
    }
    catch (err) {
      this.alertMsg = "Login failed! Please try again"
      this.alertColor = 'red'
      this.inSubmission = false
      return
    }
    this.alertMsg = "Login success!"
    this.alertColor = 'green'
    this.inSubmission = false
  }
}
