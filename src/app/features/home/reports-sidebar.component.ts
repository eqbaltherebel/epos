import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiStateService } from '../../core/services/ui-state.service';
import { SideMenuItem } from '../../core/models/api.models';

/** Left "Reports" quick-links panel + Month Abstract button (home page). */
@Component({
  selector: 'app-reports-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full">
      <h2 class="mb-2 border-b-2 border-epos-brown pb-1 text-xl font-bold text-epos-brown underline">
        Reports
      </h2>
      <ul class="divide-y divide-slate-200">
        @for (item of items(); track item.side_menu_id) {
          <li>
            <a [routerLink]="'/' + item.side_menu_link"
               class="flex items-center gap-1 py-1.5 text-sm text-gray-700 hover:text-epos-maroon">
              <span class="text-epos-brown">›</span>
              <span>{{ label(item) }}</span>
              @if (isNew(item)) {
                <img src="/images/neww2.gif" alt="new" class="ml-1 inline h-3" />
              }
            </a>
          </li>
        }
      </ul>

      <a routerLink="/AbstractTransReport"
         class="mt-4 flex items-center justify-center rounded-md bg-gradient-to-b from-epos-maroonBtn to-[#5a0f27] px-4 py-3 text-center font-bold text-white shadow hover:brightness-110">
        Month Abstract
      </a>
    </div>
  `,
})
export class ReportsSidebarComponent {
  private readonly ui = inject(UiStateService);
  items = input<SideMenuItem[]>([]);

  label(i: SideMenuItem): string {
    return this.ui.lang() === 'hi' && i.side_menu_name_hi ? i.side_menu_name_hi : i.side_menu_name_eng;
  }
  isNew(i: SideMenuItem): boolean {
    return !!i.side_menu_new && /img|gif/i.test(i.side_menu_new);
  }
}
