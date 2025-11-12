
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { AuthService } from '../../core/services/auth';
import { RegisterRequest } from '../../core/api/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Add RouterModule for routerLink
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]] // Added minLength for password
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Clear previous errors
    if (this.registerForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const request: RegisterRequest = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        // As per mtd2.md Flow 1, redirect to /setup on successful registration
        this.router.navigate(['/setup']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        // Display a more user-friendly error message
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}

