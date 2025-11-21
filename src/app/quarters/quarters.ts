import { ChangeDetectionStrategy, Component, inject, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../core/api/api';
import { apiQuartersGet } from '../core/api/functions';
import { QuartersResponse, QuarterlyUpdate } from '../core/api/models';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-quarters',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quarters.html',
  styleUrl: './quarters.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush, // Important for this debugging
})
export class Quarters implements OnInit {
  private api = inject(Api);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef

  quarters: QuarterlyUpdate[] = [];
  loading = true;
  error: string | null = null;
  firstDraftQuarterId: string | null = null; // Revert type to just 'string | null' for simplicity, as we ensure null/string explicitly

  // NEW: Properties for summary data
  totalNetProfitSubmitted: number | null = null;
  cumulativeEstimatedTaxLiability: number | null = null;

  ngOnInit(): void {
    console.log('Quarters: ngOnInit called. Initial loading:', this.loading);
    if (this.authService.isAuthenticated()) {
      console.log('Quarters: User is authenticated. Initiating fetchQuarters...');
      this.fetchQuarters();
    } else {
      console.log('Quarters: User NOT authenticated. Redirecting to login.');
      this.error = 'User not authenticated. Please log in.';
      this.loading = false;
      this.cdr.detectChanges(); // Explicitly trigger change detection
      this.router.navigate(['/auth/login']);
    }
  }

  fetchQuarters(): void {
    console.log('Quarters: fetchQuarters called. Setting loading = true and clearing error. Current loading (before update):', this.loading);
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Trigger change detection to show "Loading..." immediately

    this.api.invoke(apiQuartersGet, {})
      .then((response: QuartersResponse) => {
        console.log('Quarters: apiQuartersGet resolved. Full response object:', response);
        if (response && response.quarters) {
          this.quarters = response.quarters; // Assign response.quarters directly to quarters

          this.totalNetProfitSubmitted = response.totalNetProfitSubmitted ?? null;
          this.cumulativeEstimatedTaxLiability = response.cumulativeEstimatedTaxLiability ?? null;

          console.log(`Quarters: Received ${this.quarters.length} quarters.`);
          this.quarters.forEach((q, index) => {
            console.log(`Quarters: Quarter ${index + 1} ID: ${q.id}, Name: ${q.quarterName}, Status: ${q.status}`);
          });

          const draft = this.quarters.find((q: QuarterlyUpdate) => q.status === 'DRAFT');
          this.firstDraftQuarterId = draft ? (draft.id ?? null) : null;

          if (this.firstDraftQuarterId) {
            console.log(`Quarters: First editable draft quarter ID found: ${this.firstDraftQuarterId}`);
          } else {
            console.log('Quarters: No draft quarters found (or all have a different status).');
          }
        } else {
          this.quarters = [];
          this.error = 'No quarterly data received from API or response.quarters is empty.';
          console.warn('Quarters: API response.quarters was empty or undefined:', response);
        }
        this.loading = false;
        console.log('Quarters: fetchQuarters completed. Setting loading = false. Final loading:', this.loading);
        this.cdr.detectChanges(); // Explicitly trigger change detection after all state updates
      })
      .catch((err: any) => {
        console.error('Quarters: Failed to fetch quarters. Error details:', err);
        this.error = `Failed to load quarterly updates. Error: ${err.message || err.error?.message || 'Unknown error'}. Please try again.`;
        this.loading = false;
        this.cdr.detectChanges(); // Explicitly trigger change detection on error
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        console.log('Quarters: fetchQuarters errored. Setting loading = false. Final loading:', this.loading);
      });
  }

  navigateToEditFirstDraft(): void {
    console.log('Quarters: navigateToEditFirstDraft called. firstDraftQuarterId:', this.firstDraftQuarterId);
    if (this.firstDraftQuarterId) {
      this.router.navigate(['/quarters/edit', this.firstDraftQuarterId]);
    } else {
      this.error = 'No draft quarters available to edit. Please register a business first, or all quarters are submitted.';
      console.warn('Quarters: Attempted to navigate to edit, but no draft ID was available.');
    }
  }
}
