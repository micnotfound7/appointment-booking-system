import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        res.user.role === 'admin'
          ? this.router.navigate(['/admin/dashboard'])
          : this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
