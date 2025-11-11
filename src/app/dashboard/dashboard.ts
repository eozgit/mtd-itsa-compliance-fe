
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components

@Component({
  selector: 'app-dashboard',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add imports
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard { // Class name already follows new style guide
}
