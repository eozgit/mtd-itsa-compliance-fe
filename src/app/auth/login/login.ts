
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { LoginRequest } from '../../core/api/models';

interface CurrentUserResponse {
  userId: string;
  userName: string;
  token: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit { // Renamed from LoginComponent to Login
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    const loginRequest: LoginRequest = { email, password };

    this.authService.login(loginRequest).subscribe({
      next: (user: CurrentUserResponse) => {
        console.log('Login successful', user);
        this.router.navigate(['/setup']);
      },
      error: (err: any) => {
        console.error('Login failed', err);
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
