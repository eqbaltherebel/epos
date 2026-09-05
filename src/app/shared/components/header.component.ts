import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { extractLogos } from '../../core/services/util';
import { HeaderInfo } from '../../core/models/api.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Accessibility / language strip -->
    <div class="flex items-center justify-end gap-1 px-3 py-1 text-xs">
      <select
        class="rounded border border-gray-300 px-1 py-0.5 text-xs"
        [value]="ui.lang()"
        (change)="onLang($event)"
        aria-label="Language">
        <option value="en">Eng</option>
        <option value="hi">Hin</option>
      </select>
      <button class="ml-1 px-1 font-bold" title="Increase font size" (click)="ui.increaseFont()">+A</button>
      <button class="px-1" title="Reset font size" (click)="ui.resetFont()">A</button>
      <button class="px-1 text-xs" title="Decrease font size" (click)="ui.decreaseFont()">-A</button>
    </div>

    <!-- Main header -->
    <div class="flex items-center gap-4 px-4 pb-3 max-sm:flex-col">
      <div class="flex items-center gap-3">
        @for (logo of leftLogos(); track $index) {
          <img [src]="logo" alt="emblem" class="h-16 w-auto object-contain" />
        }
      </div>

      <div class="flex-1 text-center">
        <h1 class="text-2xl font-bold tracking-tight text-black max-sm:text-lg">
          {{ heading1() }}
        </h1>
        <h2 class="text-lg font-bold text-epos-maroon max-sm:text-sm">{{ heading2() }}</h2>
        <h3 class="text-lg font-bold text-epos-maroon max-sm:text-sm">{{ heading3() }}</h3>
      </div>

      <div class="flex items-center gap-3">
        @for (logo of rightLogos(); track $index) {
          <img [src]="logo" alt="logo" class="h-16 w-auto object-contain" />
        }
      </div>
    </div>
  `,
})
export class HeaderComponent {
  private readonly api = inject(ApiService);
  readonly ui = inject(UiStateService);

  private header = toSignal(
    this.api.getHeader(1).pipe(catchError(() => of([] as HeaderInfo[]))),
    { initialValue: [] as HeaderInfo[] }
  );

  private info = computed<HeaderInfo>(() => this.header()[0] ?? {});
  private logos = computed(() => extractLogos(this.info()));

  // Emblem + scheme logo on the left, state logo on the right.
  leftLogos = computed(() => this.logos().slice(0, 2));
  rightLogos = computed(() => this.logos().slice(2));

  heading1 = computed(
    () => (this.info()['heading_1'] as string) || 'Aadhaar enabled Public Distribution System –AePDS'
  );
  heading2 = computed(
    () => (this.info()['heading_2'] as string) || 'Food, Civil Supplies and Consumer Affairs Department'
  );
  heading3 = computed(() => (this.info()['heading_3'] as string) || 'Government of Bihar');

  onLang(e: Event) {
    this.ui.setLang((e.target as HTMLSelectElement).value as 'en' | 'hi');
  }
}
