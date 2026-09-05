import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { MenuService } from '../../core/services/menu.service';
import { ApiEnvelope, HomeData, RightMenu } from '../../core/models/api.models';
import { FALLBACK_SIDE_MENU } from '../../core/fallback-data';
import { CarouselComponent } from './carousel.component';
import { StatsDashboardComponent } from './stats-dashboard.component';
import { ReportsSidebarComponent } from './reports-sidebar.component';
import { RightAccordionComponent } from './right-accordion.component';
import { AwardsComponent } from './awards.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CarouselComponent,
    StatsDashboardComponent,
    ReportsSidebarComponent,
    RightAccordionComponent,
    AwardsComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="mx-auto max-w-[1280px] px-3 py-4">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_1fr_16rem]">
        <!-- Left reports -->
        <aside class="order-2 lg:order-1">
          <app-reports-sidebar [items]="sideItems()" />
        </aside>

        <!-- Center -->
        <section class="order-1 lg:order-2">
          <app-carousel />
          @if (stat()) {
            <app-stats-dashboard [stat]="stat()" />
          } @else if (homeStatus() === 'loading') {
            <div class="bg-black"><app-spinner message="Loading live statistics…" /></div>
          } @else {
            <div class="bg-black px-4 py-8 text-center">
              <p class="text-sm font-semibold text-orange-300">Live statistics are currently unavailable.</p>
              <p class="mt-1 text-xs text-slate-400">
                The SMART-PDS server (epos.bihar.gov.in) is not reachable right now. Figures will
                appear automatically once it is back online.
              </p>
            </div>
          }
          <p class="mt-2 text-center text-sm font-semibold text-epos-maroon">
            Distribution is in progress for the month of {{ stat()?.month || '—' }}-{{ stat()?.year || '' }} .
          </p>
        </section>

        <!-- Right accordion -->
        <aside class="order-3">
          <app-right-accordion [menus]="rightMenu()" />
          <div class="mt-3 rounded border border-gray-200 bg-slate-50 px-3 py-3 text-center shadow-sm">
            <span class="text-sm font-semibold text-gray-700">Visitors : </span>
            <span class="epos-digital text-lg text-blue-800">{{ hitCount() ?? '—' }}</span>
          </div>
        </aside>
      </div>

      <app-awards [images]="awardImages()" />
    </div>
  `,
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly menuService = inject(MenuService);

  home = signal<ApiEnvelope<HomeData> | null>(null);
  homeStatus = signal<'loading' | 'ok' | 'error'>('loading');

  rightMenu = toSignal(this.menuService.rightMenu$.pipe(catchError(() => of([] as RightMenu[]))), {
    initialValue: [] as RightMenu[],
  });

  constructor() {
    this.api.getHome().subscribe({
      next: (r) => {
        this.home.set(r);
        this.homeStatus.set('ok');
      },
      error: () => this.homeStatus.set('error'),
    });
  }

  /** Live side menu when available, otherwise the bundled fallback. */
  sideItems = computed(() => {
    const live = this.home()?.data?.side_menu;
    return live && live.length ? live : FALLBACK_SIDE_MENU;
  });

  stat = computed(() => this.home()?.data?.getEposTransLive?.[0] ?? null);
  hitCount = computed(() => this.home()?.data?.getHitCount ?? null);

  awardImages = computed(() => {
    const awards = this.rightMenu().find((m) => m.items?.some((i) => i.imgUrl));
    return (awards?.items ?? []).filter((i) => i.imgUrl).map((i) => '/' + i.imgUrl);
  });
}
