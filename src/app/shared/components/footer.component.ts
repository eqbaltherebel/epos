import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="mt-8 bg-epos-brown text-white">
      <div class="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm max-sm:justify-center max-sm:text-center">
        <div class="flex items-center gap-6">
          <a href="#" (click)="$event.preventDefault()" class="font-semibold text-orange-400 hover:underline">Disclaimer</a>
          <a href="#" (click)="$event.preventDefault()" class="font-semibold text-orange-400 hover:underline">WebSite Policies</a>
        </div>
        <div class="text-center">
          Designed &amp; Developed for
          <span class="font-semibold text-orange-400">
            Food,Civil Supplies &amp; Consumer Affairs Department</span>, Bihar
        </div>
        <div class="flex items-center gap-3">
          <span>Copyright &#64; 2024</span>
          <span class="rounded bg-white px-2 py-0.5 text-xs font-bold text-blue-700">NIC</span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
