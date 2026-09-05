import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { UiStateService } from '../../core/services/ui-state.service';
import { RightMenu, RightMenuItemData } from '../../core/models/api.models';

/** Right-hand colored accordion (Civil Supplies, Helpline, Awards, …).
 *  Header colors come straight from the API (side_menu_new). */
@Component({
  selector: 'app-right-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5">
      @for (menu of menus(); track menu.side_menu_id) {
        <div class="overflow-hidden rounded shadow-sm">
          <button
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-white"
            [style.background-color]="menu.side_menu_new || '#666'"
            (click)="toggle(menu.side_menu_id)">
            <span class="text-lg leading-none">{{ isOpen(menu.side_menu_id) ? '−' : '+' }}</span>
            <span>{{ title(menu) }}</span>
          </button>

          @if (isOpen(menu.side_menu_id)) {
            <div class="border border-t-0 border-gray-200 bg-white p-3 text-sm text-gray-700">
              @if (isAwards(menu)) {
                <div class="flex flex-wrap items-center justify-center gap-3">
                  @for (it of menu.items; track it.sno) {
                    @if (it.imgUrl) {
                      <img [src]="'/' + it.imgUrl" [alt]="menu.side_menu_name_eng" class="h-14 w-auto object-contain" />
                    }
                  }
                </div>
              } @else {
                <ul class="space-y-1">
                  @for (it of menu.items; track it.sno) {
                    <li>
                      @if (it.links) {
                        <a [href]="it.links" target="_blank" rel="noopener"
                           class="text-blue-600 hover:underline">{{ it.data || it.links }}</a>
                      } @else if (it.mail && menu.side_menu_name_eng === 'Helpline') {
                        <span class="whitespace-pre-line">{{ it.mail }}</span>
                      } @else if (it.data) {
                        <span class="whitespace-pre-line">{{ it.data }}</span>
                      }
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RightAccordionComponent {
  private readonly ui = inject(UiStateService);
  menus = input<RightMenu[]>([]);
  private open = signal<number | null>(null);

  toggle(id: number) {
    this.open.set(this.open() === id ? null : id);
  }
  isOpen(id: number) {
    return this.open() === id;
  }
  title(m: RightMenu): string {
    return this.ui.lang() === 'hi' && m.side_menu_name_hi ? m.side_menu_name_hi : m.side_menu_name_eng;
  }
  isAwards(m: RightMenu): boolean {
    return m.items?.some((i: RightMenuItemData) => !!i.imgUrl);
  }
}
