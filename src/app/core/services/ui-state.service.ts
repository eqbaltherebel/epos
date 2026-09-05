import { Injectable, effect, signal } from '@angular/core';

export type Lang = 'en' | 'hi';

/** Shared UI state: language (Eng/Hin) and accessibility font scaling (+A / A / -A). */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly lang = signal<Lang>('en');
  /** Root font-size scale, mirrors the original +A / A / -A control. */
  readonly fontScale = signal<number>(1);

  constructor() {
    effect(() => {
      const scale = this.fontScale();
      if (typeof document !== 'undefined') {
        document.documentElement.style.fontSize = `${16 * scale}px`;
      }
    });
  }

  setLang(l: Lang) {
    this.lang.set(l);
  }

  increaseFont() {
    this.fontScale.update((s) => Math.min(1.3, +(s + 0.1).toFixed(2)));
  }
  resetFont() {
    this.fontScale.set(1);
  }
  decreaseFont() {
    this.fontScale.update((s) => Math.max(0.85, +(s - 0.1).toFixed(2)));
  }
}
