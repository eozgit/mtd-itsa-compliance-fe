
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components

@Component({
  selector: 'app-setup',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add imports
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Setup { // Class name already follows new style guide
}
