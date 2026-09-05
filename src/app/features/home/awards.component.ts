import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

/** "Awards and Recognization" strip shown near the bottom of the home page. */
@Component({
  selector: 'app-awards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mt-8 text-center">
      <h2 class="text-2xl font-bold text-gray-800">Awards and Recognization</h2>
      <p class="mx-auto mt-1 max-w-2xl text-sm text-gray-600">
        Honored for excellence, innovation, and impactful achievements in our field
      </p>
      @if (images().length) {
        <div class="mt-6 flex flex-wrap items-center justify-center gap-8">
          @for (img of images(); track img) {
            <img [src]="img" alt="award" class="h-20 w-auto object-contain grayscale transition hover:grayscale-0" />
          }
        </div>
      }
    </section>
  `,
})
export class AwardsComponent {
  images = input<string[]>([]);
}
