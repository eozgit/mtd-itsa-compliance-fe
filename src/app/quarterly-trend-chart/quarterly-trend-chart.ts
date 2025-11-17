import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { QuarterlyUpdate } from '../core/api/models/quarterly-update';

@Component({
  selector: 'app-quarterly-trend-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './quarterly-trend-chart.html',
  styleUrls: ['./quarterly-trend-chart.scss'],
})
export class QuarterlyTrendChartComponent implements OnInit, OnChanges {
  @Input() quarters: QuarterlyUpdate[] = [];

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Taxable Income',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
      {
        data: [],
        label: 'Allowable Expenses',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
      },
    ],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (£)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Quarter',
        },
      },
    },
  };
  public lineChartType: 'line' = 'line';

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quarters'] && this.quarters) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    console.log('QuarterlyTrendChartComponent: updateChartData with quarters length:', this.quarters?.length);
    if (!this.quarters || this.quarters.length === 0) {
      this.lineChartData.labels = [];
      this.lineChartData.datasets[0].data = [];
      this.lineChartData.datasets[1].data = [];
      this.lineChartData = { ...this.lineChartData };
      console.log('QuarterlyTrendChartComponent: updateChartData - no quarters, setting empty data. Calling detectChanges.');
      this.cd.detectChanges();
      return;
    }

    // Sort quarters by taxYear and quarterName to ensure correct trend order
    const sortedQuarters = [...this.quarters].sort((a, b) => {
      const yearA = parseInt(a.taxYear?.split('/')[0] || '0', 10);
      const yearB = parseInt(b.taxYear?.split('/')[0] || '0', 10);
      if (yearA !== yearB) return yearA - yearB;

      const quarterOrder: { [key: string]: number } = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4 };
      return (quarterOrder[a.quarterName || ''] || 0) - (quarterOrder[b.quarterName || ''] || 0);
    });

    const newLabels = sortedQuarters.map(q => `${q.quarterName || ''} ${q.taxYear?.substring(2) || ''}`);

    // Using camelCase properties (confirmed by compiler errors) and nullish coalescing (?? 0) for safety
    const newIncomeData = sortedQuarters.map(q => q.taxableIncome ?? 0);
    const newExpensesData = sortedQuarters.map(q => q.allowableExpenses ?? 0);

    // Create a deep copy of the ChartConfiguration object to ensure ng2-charts detects the change.
    this.lineChartData = {
      labels: newLabels,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: newIncomeData
        },
        {
          ...this.lineChartData.datasets[1],
          data: newExpensesData
        },
      ],
    };

    // Removed the setTimeout. Let Angular's change detection immediately propagate.
    console.log('QuarterlyTrendChartComponent: updateChartData - updated lineChartData. Calling detectChanges immediately.');
    this.cd.detectChanges();
  }
}
