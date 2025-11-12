import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse for better typing

// Corrected import paths for generated API client models and functions
import { BusinessRequest } from '../core/api/models/business-request'; // Corrected path: '../core/api'
import { apiBusinessPost } from '../core/api/fn/api/api-business-post'; // Corrected path: '../core/api'

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Setup implements OnInit {
  businessSetupForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.businessSetupForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required] // Matches BusinessRequest.startDate (camelCase)
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Clear previous errors
    if (this.businessSetupForm.invalid) {
      this.businessSetupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const requestBody: BusinessRequest = this.businessSetupForm.value; // Form values directly map to BusinessRequest

    apiBusinessPost(this.http, '', { body: requestBody }).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Business registered successfully.');
        // As per mtd2.md Flow 2, redirect to /dashboard on successful business registration
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => { // Explicitly type 'err' as HttpErrorResponse
        this.isLoading = false;
        console.error('Business registration failed', err);
        // Display a more user-friendly error message
        // Access error message from err.error if available, otherwise fallback
        this.errorMessage = err.error?.message || err.message || 'Business registration failed. Please try again.';
      }
    });
  }
}
