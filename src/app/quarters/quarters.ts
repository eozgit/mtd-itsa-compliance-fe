import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Quarters implements OnInit {
  private api = inject(Api);
  private router = inject(Router);
  private authService = inject(AuthService);

  quarters: QuarterlyUpdate[] = [];
  loading = true;
  error: string | null = null;
  firstDraftQuarterId: string | null | undefined = null;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) { // FIX: Type guard 'unknown' removed as imports are fixed
      this.fetchQuarters();
    } else {
      this.error = 'User not authenticated. Please log in.';
      this.loading = false;
      this.router.navigate(['/auth/login']);
    }
  }

  fetchQuarters(): void {
    this.loading = true;
    this.error = null;
    this.api.invoke(apiQuartersGet, {}) // FIX: Type guard 'unknown' removed as imports are fixed
      .then((response: QuartersResponse) => {
        if (response && response.quarters) {
          this.quarters = response.quarters;
          const draft = this.quarters.find((q: QuarterlyUpdate) => q.status === 'Draft'); // FIX: Explicitly type 'q'
          if (draft) {
            this.firstDraftQuarterId = draft.id ?? null;
          }
        } else {
          this.quarters = [];
          this.error = 'No quarterly data received.';
        }
        this.loading = false;
      })
      .catch((err: any) => { // FIX: Explicitly type 'err'
        console.error('Failed to fetch quarters:', err);
        this.error = 'Failed to load quarterly updates. Please try again.';
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout(); // FIX: Type guard 'unknown' removed as imports are fixed
          this.router.navigate(['/auth/login']);
        }
      });
  }

  navigateToEditFirstDraft(): void {
    if (this.firstDraftQuarterId) {
      this.router.navigate(['/quarters/edit', this.firstDraftQuarterId]);
    } else {
      this.error = 'No draft quarters available to edit. Please register a business first, or all quarters are submitted.';
    }
  }
}
