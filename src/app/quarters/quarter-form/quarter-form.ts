import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// FIX: Changed path from ../core/api/api to ../../core/api/api
import { Api } from '../../core/api/api';
// FIX: Changed path from ../core/api/functions to ../../core/api/functions
import { apiQuarterIdPut, apiQuarterIdSubmitPost, apiQuartersGet } from '../../core/api/functions';
// FIX: Changed path from ../core/api/models to ../../core/api/models
import { QuartersResponse, QuarterlyUpdate, QuarterlyUpdateRequest, QuarterSubmissionResponse, QuarterUpdateResponse } from '../../core/api/models';
// FIX: Changed path from ../core/services/auth to ../../core/services/auth
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-quarter-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quarter-form.html',
  styleUrl: './quarter-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(Api);
  private authService = inject(AuthService);

  quarterForm!: FormGroup;
  quarterId: string | null = null;
  isEditMode = false;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Internal state to hold the full quarter details for display purposes,
  // especially quarterName and taxYear which are not part of the form submission
  public currentQuarterDetails: QuarterlyUpdate | null = null;

  async ngOnInit(): Promise<void> {
    this.quarterId = this.route.snapshot.paramMap.get('id');

    this.initForm();

    if (!this.quarterId) { // If navigating to /quarters/new or no ID provided, look for a draft
      await this.findOrCreateDraftQuarterAndRedirect();
    } else {
      this.isEditMode = true; // Confirmed ID means it's an existing quarter
      await this.fetchQuarterDetails(this.quarterId);
    }
  }

  initForm(): void {
    // Form now uses aggregated values as per backend API
    // periodStart and periodEnd are NOT part of the QuarterlyUpdateRequest
    // They will be displayed from currentQuarterDetails if available
    this.quarterForm = this.fb.group({
      taxableIncome: [0, [Validators.required, Validators.min(0)]],
      allowableExpenses: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private async findOrCreateDraftQuarterAndRedirect(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      // FIX: Correctly type response as QuartersResponse
      const response: QuartersResponse = await this.api.invoke(apiQuartersGet, {});
      // FIX: Explicitly type 'q' as QuarterlyUpdate
      const firstDraftQuarter = response.quarters?.find((q: QuarterlyUpdate) => q.status === 'Draft');

      if (firstDraftQuarter) {
        // Redirect to the edit form for the first found draft quarter
        this.router.navigate(['/quarters/edit', firstDraftQuarter.id]);
      } else {
        this.error = 'No draft quarters available to edit. Please register a business first (which generates initial drafts).';
      }
    } catch (err: any) {
      console.error('Failed to find draft quarter:', err);
      this.error = 'Failed to load quarters to find a draft. Please try again.';
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    } finally {
      this.loading = false;
    }
  }

  async fetchQuarterDetails(id: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      // FIX: Correctly type response as QuartersResponse
      const response: QuartersResponse = await this.api.invoke(apiQuartersGet, {});
      // FIX: Explicitly type 'q' as QuarterlyUpdate
      const quarter = response.quarters?.find((q: QuarterlyUpdate) => q.id === id);

      if (quarter) {
        this.currentQuarterDetails = quarter; // Store full quarter for display (quarterName, taxYear, etc.)
        this.quarterForm.patchValue({
          taxableIncome: quarter.taxableIncome || 0,
          allowableExpenses: quarter.allowableExpenses || 0,
        });
        // Disable form fields if quarter is already submitted
        if (quarter.status === 'Submitted') {
          this.quarterForm.disable();
          this.error = 'This quarter has already been submitted and cannot be edited.';
        }
      } else {
        this.error = 'Quarter not found.';
        this.router.navigate(['/quarters']);
      }
    } catch (err: any) {
      console.error('Failed to fetch quarter details:', err);
      this.error = 'Failed to load quarter details. Please try again.';
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(submit: boolean): Promise<void> {
    this.quarterForm.markAllAsTouched();
    if (!this.quarterForm.valid) {
      this.error = 'Please correct the highlighted errors.';
      return;
    }
    if (!this.quarterId) {
      this.error = 'Cannot perform operation: Quarter ID is missing.';
      return;
    }
    if (this.currentQuarterDetails?.status === 'Submitted') {
      this.error = 'Cannot edit or submit a quarter that has already been submitted.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.quarterForm.value;
    // Request body now only contains aggregated income/expenses
    const requestBody: QuarterlyUpdateRequest = {
      taxableIncome: formValue.taxableIncome,
      allowableExpenses: formValue.allowableExpenses,
    };

    try {
      // Always save the current draft data via PUT first
      const updateResponse: QuarterUpdateResponse = await this.api.invoke(apiQuarterIdPut, { id: this.quarterId, body: requestBody });
      this.successMessage = `Quarter ${updateResponse.id} saved as draft successfully!`;

      if (submit) {
        // If submitting, then call the submit POST endpoint (which takes no body as per backend)
        const submitResponse: QuarterSubmissionResponse = await this.api.invoke(apiQuarterIdSubmitPost, { id: this.quarterId });
        this.successMessage = `Quarter ${submitResponse.id} submitted successfully! Ref: ${submitResponse.submissionDetails?.refNumber}`;
      }
      this.loading = false;
      this.router.navigate(['/quarters']); // Navigate back to the quarters list on success
    } catch (err: any) {
      console.error('Quarter operation failed:', err);
      // Backend error messages are often in err.error.message or err.error.errors
      this.error = err.error?.message || err.message || 'Failed to perform quarter operation. Please try again.';
      this.loading = false;
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/quarters']);
  }

  // No periodStart/periodEnd getters for form, use currentQuarterDetails for display
  get taxableIncome() { return this.quarterForm.get('taxableIncome'); }
  get allowableExpenses() { return this.quarterForm.get('allowableExpenses'); }
}
