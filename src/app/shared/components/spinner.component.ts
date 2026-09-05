import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-10">
      <div class="epos-spinner"></div>
      <p class="text-sm text-gray-600">{{ message() }}</p>
    </div>
  `,
})
export class SpinnerComponent {
  message = input('Loading…');
}
