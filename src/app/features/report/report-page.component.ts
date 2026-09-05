import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { MenuService } from '../../core/services/menu.service';
import { getReportConfig, ReportConfig } from '../../core/reports.registry';
import { humanize, toTable } from '../../core/services/util';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { ReportFilterComponent, ReportFilterValue } from './report-filter.component';

type Status = 'idle' | 'loading' | 'data' | 'empty' | 'error' | 'unwired';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, DataTableComponent, ReportFilterComponent],
  template: `
    <div class="mx-auto max-w-6xl px-3 py-5">
      <div class="epos-card !max-w-full">
        <div class="epos-card__title">{{ title() }}</div>

        <!-- Filter -->
        @if (config().filter !== 'none') {
          <app-report-filter [kind]="config().filter" (search)="run($event)" />
        }

        <!-- Result states -->
        @switch (status()) {
          @case ('loading') { <app-spinner message="Fetching report…" /> }
          @case ('error') {
            <div class="m-4 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              <p class="font-semibold">Could not load this report.</p>
              <p class="mt-1">{{ errorMsg() }}</p>
            </div>
          }
          @case ('empty') {
            <p class="py-8 text-center text-sm text-gray-500">No records found for the selected criteria.</p>
          }
          @case ('unwired') {
            <div class="m-4 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <p class="font-semibold">Live filter connected — result endpoint not yet mapped.</p>
              <p class="mt-1">
                The filter above uses the live District / Month / Year endpoints from the SMART-PDS
                backend. This particular report's result endpoint hasn't been confirmed against the
                server in this build. Map it in <code>core/reports.registry.ts</code> to enable live data.
              </p>
            </div>
          }
          @case ('data') {
            <div class="p-3">
              <app-data-table [columns]="columns()" [rows]="rows()" />
            </div>
          }
          @default {
            @if (config().filter !== 'none') {
              <p class="py-8 text-center text-sm text-gray-500">
                Select the criteria above and click <strong>Submit</strong>.
              </p>
            }
          }
        }
      </div>
    </div>
  `,
})
export class ReportPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly menuService = inject(MenuService);

  link = signal<string>('');
  config = signal<ReportConfig>({ filter: 'monthYearDistrict' });
  title = signal<string>('Report');
  status = signal<Status>('idle');
  errorMsg = signal<string>('');
  columns = signal<string[]>([]);
  rows = signal<Array<Record<string, unknown>>>([]);

  private sub: Subscription;
  private titleSub: Subscription;

  constructor() {
    // Build the live title index once.
    this.titleSub = this.menuService.publicMenus$
      .pipe(catchError(() => of([])))
      .subscribe((menus) => {
        this.menuService.indexTitles(menus, []);
        this.refreshTitle();
      });

    this.sub = this.route.params.subscribe((p) => {
      const link = p['link'] ?? '';
      this.link.set(link);
      const cfg = getReportConfig(link);
      this.config.set(cfg);
      this.refreshTitle();
      this.reset();
      // Filters of kind 'none' fetch immediately.
      if (cfg.filter === 'none') this.run({});
    });
  }

  private refreshTitle() {
    const link = this.link();
    const cfg = getReportConfig(link);
    this.title.set(cfg.title ?? this.menuService.lookupTitle(link) ?? humanize(link));
  }

  private reset() {
    this.status.set('idle');
    this.columns.set([]);
    this.rows.set([]);
    this.errorMsg.set('');
  }

  run(filter: ReportFilterValue) {
    const link = this.link();
    this.status.set('loading');

    if (link === 'AbstractTransReport') {
      const date = filter.date ?? new Date().toISOString().slice(0, 10);
      this.api
        .detailedTransactions(date)
        .pipe(catchError((e) => this.fail(e)))
        .subscribe((res) => this.render(res));
      return;
    }

    if (link === 'dfso_fps_details') {
      this.api
        .fpsActiveMonthYear()
        .pipe(
          catchError(() => of({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })),
          switchMap((my) => this.api.fpsSummary(my.month, my.year).pipe(catchError((e) => this.fail(e))))
        )
        .subscribe((res) => this.render(res));
      return;
    }

    const cfg = this.config();
    if (cfg.fetch?.confirmed) {
      const call =
        cfg.fetch.method === 'POST'
          ? this.api.reportPost(cfg.fetch.path, filter)
          : this.api.reportGet(cfg.fetch.path, this.toParams(filter));
      call.pipe(catchError((e) => this.fail(e))).subscribe((res) => this.render(res));
      return;
    }

    // No confirmed result endpoint — show the honest "unwired" state.
    this.status.set('unwired');
  }

  private toParams(f: ReportFilterValue): Record<string, string | number> {
    const p: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(f)) if (v != null && v !== '') p[k] = v;
    return p;
  }

  private fail(e: unknown) {
    const msg =
      (e as { error?: { message?: string }; message?: string })?.error?.message ??
      (e as { message?: string })?.message ??
      'The server returned an error. When running locally, ensure the dev proxy can reach epos.bihar.gov.in.';
    this.errorMsg.set(msg);
    this.status.set('error');
    return of(null);
  }

  private render(res: unknown) {
    if (res == null) return; // fail() already set error state
    const { columns, rows } = toTable(res);
    if (!rows.length) {
      this.status.set('empty');
      return;
    }
    this.columns.set(columns);
    this.rows.set(rows);
    this.status.set('data');
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.titleSub?.unsubscribe();
  }
}
