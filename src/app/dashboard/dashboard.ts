import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs'; // Subject is still needed for OnDestroy

import { Api } from '../core/api/api';
import { apiQuartersGet } from '../core/api/functions';
import { QuartersResponse } from '../core/api/models/quarters-response'; // Import the main response model for /api/quarters
import { QuarterlyUpdate } from '../core/api/models/quarterly-update';
import { QuarterlyTrendChartComponent } from '../quarterly-trend-chart/quarterly-trend-chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    QuarterlyTrendChartComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {
  // Store the full response for the chart and other potential dashboard elements
  quartersData: QuarterlyUpdate[] = [];

  // No need for destroy$ or takeUntil since we're using Promises (async/await)
  // private destroy$ = new Subject<void>();

  // FIX 1: Correctly type the injected service as 'Api' and use a consistent name (e.g., 'api')
  constructor(private api: Api, private cdRef: ChangeDetectorRef) { }

  // FIX 2: Use async/await structure because Api.invoke returns a Promise
  async ngOnInit(): Promise<void> {
    try {
      // FIX 3: Call Api.invoke(), passing the imported function and the parameters (which are {})
      const data: QuartersResponse = await this.api.invoke(apiQuartersGet, {});

      // FIX 4: Assign the Quarters array from the response
      this.quartersData = data.quarters || [];
      console.log('Fetched quarterly data:', this.quartersData);

      // Note: You must also call ChangeDetectorRef.detectChanges()
      // if you need to trigger a change cycle with OnPush strategy.

      this.cdRef.detectChanges();
    } catch (err) {
      console.error('Error fetching quarterly data:', err);
      // Handle error
    }
  }

  // The destroy$ logic is no longer needed since we are using Promises (await)
  // instead of Observables (subscribe) for the API call.
  ngOnDestroy(): void {
    // If you add other Observables later, implement this cleanup:
    // this.destroy$.next();
    // this.destroy$.complete();
  }
}
