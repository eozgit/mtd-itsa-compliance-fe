import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../core/api/api';
import { apiQuarterIdPut, apiQuarterIdSubmitPost, apiQuartersGet } from '../../core/api/functions';
import { QuartersResponse, QuarterlyUpdate, QuarterlyUpdateRequest, QuarterSubmissionResponse, QuarterUpdateResponse } from '../../core/api/models';
import { AuthService } from '../../core/services/auth';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-quarter-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quarter-form.html',
  styleUrl: './quarter-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(Api);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef); // Injected ChangeDetectorRef

  quarterForm!: FormGroup;
  quarterId: string | null = null;
  isEditMode = false;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  public currentQuarterDetails: QuarterlyUpdate | null = null;
  public netProfit: number | null = null;

  private destroy$ = new Subject<void>();

  async ngOnInit(): Promise<void> {
    this.quarterId = this.route.snapshot.paramMap.get('id');
    console.log('QuarterForm: ngOnInit - quarterId:', this.quarterId); // DEBUG LOG

    this.initForm();
    this.setupNetProfitCalculation();

    if (!this.quarterId) {
      await this.findOrCreateDraftQuarterAndRedirect();
    } else {
      this.isEditMode = true;
      await this.fetchQuarterDetails(this.quarterId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.quarterForm = this.fb.group({
      taxableIncome: [0, [Validators.required, Validators.min(0)]],
      allowableExpenses: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private setupNetProfitCalculation(): void {
    this.quarterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const income = value.taxableIncome ?? 0;
        const expenses = value.allowableExpenses ?? 0;
        this.netProfit = income - expenses;
        this.cdr.detectChanges(); // Trigger change detection when netProfit updates
      });
  }

  private async findOrCreateDraftQuarterAndRedirect(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const response: QuartersResponse = await this.api.invoke(apiQuartersGet, {});
      const firstDraftQuarter = response.quarters?.find((q: QuarterlyUpdate) => q.status === 'DRAFT');

      if (firstDraftQuarter) {
        this.router.navigate(['/quarters/edit', firstDraftQuarter.id]);
      } else {
        this.error = 'No draft quarters available to edit. Please register a business first (which generates initial drafts).';
      }
    } catch (err: any) {
      console.error('QuarterForm: Failed to find draft quarter:', err); // DEBUG LOG
      this.error = err.error?.message || err.message || 'Failed to load quarters to find a draft. Please try again.';
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    } finally {
      this.loading = false;
      console.log('QuarterForm: findOrCreateDraftQuarterAndRedirect - finished. Loading:', this.loading, 'Error:', this.error); // DEBUG LOG
      this.cdr.detectChanges(); // Explicitly trigger change detection after loading state is updated
    }
  }

  async fetchQuarterDetails(id: string): Promise<void> {
    this.loading = true;
    this.error = null;
    console.log('QuarterForm: fetchQuarterDetails - starting for ID:', id); // DEBUG LOG
    try {
      const response: QuartersResponse = await this.api.invoke(apiQuartersGet, {});
      const quarter = response.quarters?.find((q: QuarterlyUpdate) => q.id === id);

      if (quarter) {
        this.currentQuarterDetails = quarter;
        this.quarterForm.patchValue({
          taxableIncome: quarter.taxableIncome || 0,
          allowableExpenses: quarter.allowableExpenses || 0,
        });
        this.netProfit = (quarter.taxableIncome ?? 0) - (quarter.allowableExpenses ?? 0);
        console.log('QuarterForm: Initial netProfit set:', this.netProfit); // DEBUG LOG
        if (quarter.status === 'SUBMITTED') {
          this.quarterForm.disable();
          this.error = 'This quarter has already been submitted and cannot be edited.';
        }
      } else {
        this.error = 'Quarter not found.';
        this.router.navigate(['/quarters']);
      }
    } catch (err: any) {
      console.error('QuarterForm: Failed to fetch quarter details:', err); // DEBUG LOG
      this.error = err.error?.message || err.message || 'Failed to load quarter details. Please try again.';
      if (err.status === 401 || err.status === 403) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    } finally {
      this.loading = false;
      console.log('QuarterForm: fetchQuarterDetails - finished. Loading:', this.loading, 'Error:', this.error); // DEBUG LOG
      this.cdr.detectChanges(); // Explicitly trigger change detection after loading state is updated
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
    if (this.currentQuarterDetails?.status === 'SUBMITTED') {
      this.error = 'Cannot edit or submit a quarter that has already been submitted.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.quarterForm.value;
    const requestBody: QuarterlyUpdateRequest = {
      taxableIncome: formValue.taxableIncome,
      allowableExpenses: formValue.allowableExpenses,
    };

    try {
      const updateResponse: QuarterUpdateResponse = await this.api.invoke(apiQuarterIdPut, { id: this.quarterId, body: requestBody });
      this.successMessage = `Quarter ${updateResponse.id} saved as draft successfully!`;

      if (submit) {
        const submitResponse: QuarterSubmissionResponse = await this.api.invoke(apiQuarterIdSubmitPost, { id: this.quarterId });
        this.successMessage = `Quarter ${submitResponse.id} submitted successfully! Ref: ${submitResponse.submissionDetails?.refNumber}`;
      }
      this.loading = false;
      this.router.navigate(['/quarters']);
    } catch (err: any) {
      console.error('QuarterForm: Quarter operation failed:', err); // DEBUG LOG
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

  get taxableIncome() { return this.quarterForm.get('taxableIncome'); }
  get allowableExpenses() { return this.quarterForm.get('allowableExpenses'); }
}
