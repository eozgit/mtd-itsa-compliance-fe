import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts'; // Import NgChartsModule for standalone
import { QuarterlyUpdate } from '../core/api/models/quarterly-update'; // Corrected path to generated model

@Component({
  selector: 'app-quarterly-trend-chart',
  standalone: true, // Mark as standalone
  imports: [CommonModule, BaseChartDirective], // Add CommonModule and NgChartsModule here
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

  constructor() { }

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quarters'] && this.quarters) {
      console.log('QuarterlyTrendChartComponent: quarters @Input received', this.quarters); // ADD THIS
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    console.log('QuarterlyTrendChartComponent: updateChartData called with quarters', this.quarters); // ADD THIS
    if (!this.quarters || this.quarters.length === 0) {
      this.lineChartData.labels = [];
      this.lineChartData.datasets[0].data = [];
      this.lineChartData.datasets[1].data = [];
      console.log('QuarterlyTrendChartComponent: No quarters data, chart will be empty.'); // ADD THIS
      return;
    }

    // Sort quarters by taxYear and quarterName to ensure correct trend order
    const sortedQuarters = [...this.quarters].sort((a, b) => {
      // Handle potential undefined taxYear or quarterName gracefully
      const yearA = parseInt(a.taxYear?.split('/')[0] || '0', 10);
      const yearB = parseInt(b.taxYear?.split('/')[0] || '0', 10);
      if (yearA !== yearB) return yearA - yearB;

      const quarterOrder: { [key: string]: number } = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4 };
      return (quarterOrder[a.quarterName || ''] || 0) - (quarterOrder[b.quarterName || ''] || 0);
    });

    this.lineChartData.labels = sortedQuarters.map(q => `${q.quarterName || ''} ${q.taxYear?.substring(2) || ''}`);
    this.lineChartData.datasets[0].data = sortedQuarters.map(q => q.taxableIncome || 0);
    this.lineChartData.datasets[1].data = sortedQuarters.map(q => q.allowableExpenses || 0);

    console.log('QuarterlyTrendChartComponent: Income data:', this.lineChartData.datasets[0].data); // ADD THIS
    console.log('QuarterlyTrendChartComponent: Expenses data:', this.lineChartData.datasets[1].data); // ADD THIS
    console.log('QuarterlyTrendChartComponent: Chart labels:', this.lineChartData.labels); // ADD THIS
    // This is important to trigger chart update in ng2-charts
    this.lineChartData = { ...this.lineChartData };
  }
}
