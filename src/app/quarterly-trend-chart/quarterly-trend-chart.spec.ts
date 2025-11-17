import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterlyTrendChart } from './quarterly-trend-chart';

describe('QuarterlyTrendChart', () => {
  let component: QuarterlyTrendChart;
  let fixture: ComponentFixture<QuarterlyTrendChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarterlyTrendChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuarterlyTrendChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
