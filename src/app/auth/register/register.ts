
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components for directives like ngIf, ngFor
import { ReactiveFormsModule } from '@angular/forms'; // Add if you plan to use forms

@Component({
  selector: 'app-register',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // Add imports
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register { // Class name already follows new style guide
}
