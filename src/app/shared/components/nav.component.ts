import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { PublicMenu, PublicMenuChild } from '../../core/models/api.models';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-epos-brown text-white shadow-md">
      <div class="mx-auto flex items-stretch">
        <!-- Home -->
        <a routerLink="/" class="flex items-center px-4 py-2.5 hover:bg-epos-brownDark" title="Home">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8z" />
          </svg>
        </a>

        <!-- Desktop menus -->
        <ul class="hidden flex-1 items-stretch md:flex">
          @for (menu of menus(); track menu.menu_id) {
            <li class="group relative">
              @if (menu.menu_link && menu.menu_link !== '#') {
                <a [routerLink]="'/' + menu.menu_link"
                   class="flex h-full items-center px-3 py-2.5 text-sm font-semibold hover:bg-epos-brownDark">
                  {{ label(menu) }}
                </a>
              } @else {
                <button
                  class="flex h-full items-center gap-1 px-3 py-2.5 text-sm font-semibold hover:bg-epos-brownDark">
                  {{ label(menu) }}
                  @if (menu.menu_list.length) {
                    <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7l5 6 5-6z"/></svg>
                  }
                </button>
              }
              @if (menu.menu_list.length) {
                <ul class="invisible absolute left-0 top-full z-30 w-64 border border-gray-200 bg-white py-1 text-gray-800 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  @for (child of menu.menu_list; track child.lid) {
                    <li>
                      <a [routerLink]="'/' + child.link"
                         class="block px-4 py-2 text-sm hover:bg-slate-100 hover:text-epos-maroon">
                        {{ childLabel(child) }}
                      </a>
                    </li>
                  }
                </ul>
              }
            </li>
          }
        </ul>

        <!-- Mobile toggle -->
        <button class="ml-auto px-4 md:hidden" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Login -->
        <a href="#" class="my-1.5 mr-2 hidden items-center gap-1 rounded bg-white px-3 py-1.5 text-sm font-semibold text-blue-600 md:flex"
           (click)="$event.preventDefault()">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          Login
        </a>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <ul class="md:hidden">
          @for (menu of menus(); track menu.menu_id) {
            <li class="border-t border-epos-brownDark">
              <button class="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold"
                      (click)="toggle(menu.menu_id)">
                {{ label(menu) }}
                @if (menu.menu_list.length) { <span>{{ openId() === menu.menu_id ? '−' : '+' }}</span> }
              </button>
              @if (openId() === menu.menu_id) {
                <ul class="bg-epos-brownDark">
                  @for (child of menu.menu_list; track child.lid) {
                    <li>
                      <a [routerLink]="'/' + child.link" (click)="mobileOpen.set(false)"
                         class="block px-6 py-2 text-sm">{{ childLabel(child) }}</a>
                    </li>
                  }
                </ul>
              }
            </li>
          }
          <li class="border-t border-epos-brownDark">
            <a href="#" (click)="$event.preventDefault()" class="block px-4 py-2 text-sm font-semibold">Login</a>
          </li>
        </ul>
      }
    </nav>
  `,
})
export class NavComponent {
  private readonly menuService = inject(MenuService);
  private readonly ui = inject(UiStateService);

  menus = toSignal(this.menuService.publicMenus$.pipe(catchError(() => of([] as PublicMenu[]))), {
    initialValue: [] as PublicMenu[],
  });

  mobileOpen = signal(false);
  openId = signal<number | null>(null);

  toggle(id: number) {
    this.openId.set(this.openId() === id ? null : id);
  }

  label(m: PublicMenu): string {
    return this.ui.lang() === 'hi' && m.menu_name_hi ? m.menu_name_hi : m.menu_name_eng;
  }
  childLabel(c: PublicMenuChild): string {
    return this.ui.lang() === 'hi' && c.name_hi ? c.name_hi : c.name;
  }
}
