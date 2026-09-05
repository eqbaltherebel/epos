import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';

/** Auto-rotating banner carousel. Images are the original site's banners,
 *  served through the dev proxy from /static/media. */
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-48 w-full overflow-hidden bg-slate-200 sm:h-56">
      @for (img of images; track img; let i = $index) {
        <img [src]="img" alt="banner"
             class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
             [class.opacity-100]="i === current()"
             [class.opacity-0]="i !== current()" />
      }

      <button class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/60 p-1 text-blue-600 hover:bg-white"
              (click)="prev()" aria-label="Previous">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/60 p-1 text-blue-600 hover:bg-white"
              (click)="next()" aria-label="Next">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
        @for (img of images; track img; let i = $index) {
          <button class="h-2 w-2 rounded-full"
                  [class.bg-blue-600]="i === current()" [class.bg-white]="i !== current()"
                  (click)="current.set(i)" aria-label="Go to slide"></button>
        }
      </div>
    </div>
  `,
})
export class CarouselComponent implements OnInit, OnDestroy {
  readonly images = [
    '/static/media/header-a.04681c3ed25b57b520a7.jpg',
    '/static/media/header-b.c1367a03b1e9b2f3fc2a.jpg',
    '/static/media/header-c.6b7caf5b905c36d69142.jpg',
    '/static/media/header-d.26d2d49a5630a94416ca.jpg',
    '/static/media/header-h.170e7899bed57bbb4a8a.jpg',
  ];
  current = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.timer = setInterval(() => this.next(), 4000);
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  next() {
    this.current.update((c) => (c + 1) % this.images.length);
  }
  prev() {
    this.current.update((c) => (c - 1 + this.images.length) % this.images.length);
  }
}
