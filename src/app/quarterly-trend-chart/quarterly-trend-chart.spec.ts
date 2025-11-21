import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterlyTrendChartComponent } from './quarterly-trend-chart';

describe('QuarterlyTrendChart', () => {
  let component: QuarterlyTrendChartComponent;
  let fixture: ComponentFixture<QuarterlyTrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarterlyTrendChartComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QuarterlyTrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
