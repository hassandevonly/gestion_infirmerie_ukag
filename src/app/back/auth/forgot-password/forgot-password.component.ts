import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private route: Router) {
    this.forgotForm = this.fb.group({
      email: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }
  onSubmit() {
    if (this.forgotForm.valid) {
      console.log(this.forgotForm.value);
      this.authService.resetPassword(this.forgotForm.value.email);
      this.route.navigate(['/login']);
    } else {
      console.log("Formulaire invalide " + this.forgotForm.value.email);
    }
  }

}
