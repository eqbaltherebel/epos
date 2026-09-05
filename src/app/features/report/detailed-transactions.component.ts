import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DetailedTransEnvelope } from '../../core/models/api.models';
import { SpinnerComponent } from '../../shared/components/spinner.component';

type Row = Record<string, unknown>;

interface Panel {
  level: 0 | 1 | 2 | 3; // 0 district, 1 office, 2 fps, 3 rc
  title: string; // '' for L0, else "Detailed Transactions For X"
  monthName: string;
  date: string;
  rows: Row[];
  loading: boolean;
  error: string;
  ctx: { distCode?: string; afsoCode?: string; fpsId?: string };
}

/**
 * Detailed Transactions (route AbstractTransReport) — reproduces the production
 * drill-down District -> Office -> FPS -> RC transactions.
 * Verified endpoints (all POST, under /Epos_Spring):
 *   L1 api/DetailedTrans/details {date}
 *   L2 api/DetailedTrans/office  {date, distCode}
 *   L3 api/DetailedTrans/fps     {date, distCode, afsoCode}
 *   L4 api/DetailedTrans/Rc      {date, distCode, afsoCode, fpsId}
 */
@Component({
  selector: 'app-detailed-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  template: `
    <div class="mx-auto max-w-[1600px] px-3 py-5">
      <!-- Filter card -->
      <div class="epos-card !max-w-3xl">
        <div class="epos-card__title">Detailed Transactions</div>
        <div class="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <label class="w-24 font-semibold text-gray-700">Date</label>
          <input type="date" class="rounded border border-gray-300 px-2 py-1 text-sm" [(ngModel)]="date" />
        </div>
        <div class="flex justify-center gap-2 bg-amber-50 py-2">
          <button class="epos-btn" (click)="submit()" [disabled]="submitting()">Submit</button>
          <button class="epos-btn" (click)="back()">Back</button>
        </div>
      </div>

      @if (submitting()) { <app-spinner message="Fetching report…" /> }

      @for (p of panels(); track p.level) {
        <div class="mt-6">
          @if (p.title) {
            <h3 class="mb-1 bg-epos-brown px-3 py-2 text-center text-base font-bold text-white">{{ p.title }}</h3>
          }
          @if (p.loading) {
            <app-spinner message="Loading…" />
          } @else if (p.error) {
            <div class="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{{ p.error }}</div>
          } @else if (p.level < 3) {
            <!-- Metric table (district / office / fps) -->
            <div class="overflow-x-auto">
              <table class="epos-table">
                <thead>
                  <tr>
                    <th rowspan="3" style="width:48px">Sl.No</th>
                    <th rowspan="3">{{ nameLabel(p.level) }}</th>
                    @if (p.level === 2) { <th rowspan="3">FPS Name</th> }
                    <th rowspan="3">Total Cards (A)</th>
                    <th [attr.colspan]="10">Date : {{ p.date }}</th>
                    <th [attr.colspan]="10">{{ p.monthName }}</th>
                    <th rowspan="3">Total Availed %<br />(E*100)/A</th>
                    <th rowspan="3">Partial %<br />(Against Availed Cards)(C*100)/E</th>
                  </tr>
                  <tr>
                    <th colspan="6">Trans</th>
                    <th colspan="4">Availed Cards</th>
                    <th colspan="6">Trans</th>
                    <th colspan="4">Availed Cards</th>
                  </tr>
                  <tr>
                    @for (s of transSub; track s) { <th>{{ s }}</th> }
                    @for (s of availSub; track s) { <th>{{ s }}</th> }
                    @for (s of transSub; track s) { <th>{{ s }}</th> }
                    @for (s of availSubMonth; track s) { <th>{{ s }}</th> }
                  </tr>
                </thead>
                <tbody>
                  @for (row of p.rows; track $index) {
                    <tr>
                      <td class="text-center">{{ $index + 1 }}</td>
                      <td>
                        <a class="cursor-pointer text-blue-700 underline" (click)="drill(p, row)">{{ name(p.level, row) }}</a>
                      </td>
                      @if (p.level === 2) { <td>{{ row['del_name'] }}</td> }
                      <td class="text-right">{{ n(row['total_cards']) }}</td>
                      @for (k of dateTransKeys; track k) { <td class="text-right">{{ n(row[k]) }}</td> }
                      @for (k of dateAvailKeys; track k) { <td class="text-right">{{ n(row[k]) }}</td> }
                      @for (k of monthTransKeys; track k) { <td class="text-right">{{ n(row[k]) }}</td> }
                      @for (k of monthAvailKeys; track k) { <td class="text-right">{{ n(row[k]) }}</td> }
                      <td class="text-right">{{ pct(row['total_availed'], row['total_cards']) }}</td>
                      <td class="text-right">{{ num2(row['partial']) }}</td>
                    </tr>
                  }
                  <!-- Total row -->
                  <tr class="bg-epos-brown font-bold text-white">
                    <td [attr.colspan]="p.level === 2 ? 3 : 2" class="text-center">Total</td>
                    <td class="text-right">{{ sum(p.rows, 'total_cards') }}</td>
                    @for (k of allMetricKeys; track k) { <td class="text-right">{{ sum(p.rows, k) }}</td> }
                    <td class="text-right">{{ pct(sum(p.rows,'total_availed'), sum(p.rows,'total_cards')) }}</td>
                    <td class="text-right">{{ pct(sum(p.rows,'avail_poff_cards'), sum(p.rows,'total_availed')) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-1 flex justify-center">
              <button class="epos-btn" (click)="exportMetric(p)">Export to Excel</button>
            </div>
          } @else {
            <!-- RC transaction table (deepest) -->
            <div class="overflow-x-auto">
              <table class="epos-table">
                <thead>
                  <tr>
                    <th>Sl.No</th>
                    @for (c of rcCols; track c.key) { <th>{{ c.label }}</th> }
                  </tr>
                </thead>
                <tbody>
                  @for (row of p.rows; track $index) {
                    <tr>
                      <td class="text-center">{{ $index + 1 }}</td>
                      @for (c of rcCols; track c.key) { <td>{{ row[c.key] }}</td> }
                    </tr>
                  }
                  @if (!p.rows.length) {
                    <tr><td [attr.colspan]="rcCols.length + 1" class="py-6 text-center text-gray-500">No transactions found.</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="mt-1 flex justify-center">
              <button class="epos-btn" (click)="exportRc(p)">Export to Excel</button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DetailedTransactionsComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  date = new Date().toISOString().slice(0, 10);
  submitting = signal(false);
  panels = signal<Panel[]>([]);

  // Column definitions (verified field names from production)
  transSub = ['Biometric', 'Aadhar OTP', 'Mobile OTP', 'Iris', 'Partial Offline', 'Total'];
  availSub = ['Portability', 'Partial Offline', 'Online', 'Total'];
  availSubMonth = ['Portability (B)', 'Partial Offline (C)', 'Online (D)', 'Total (E = C+D)'];
  dateTransKeys = ['avail_bio_trans_today', 'avail_otp_trans_today', 'avail_motp_trans_today', 'avail_iris_trans_today', 'avail_poff_trans_today', 'avail_trans_today'];
  dateAvailKeys = ['avail_port_cards_today', 'avail_poff_cards_today', 'online_cards_today', 'avail_cards_today'];
  monthTransKeys = ['avail_bio_trans', 'avail_otp_trans', 'avail_motp_trans', 'avail_iris_trans', 'avail_poff_trans', 'avail_trans'];
  monthAvailKeys = ['avail_port_cards', 'avail_poff_cards', 'online_cards', 'total_availed'];
  get allMetricKeys() { return [...this.dateTransKeys, ...this.dateAvailKeys, ...this.monthTransKeys, ...this.monthAvailKeys]; }

  rcCols = [
    { key: 'existing_rc_number', label: 'RC Number' },
    { key: 'trans_status', label: 'Status' },
    { key: 'scheme_short_name', label: 'Scheme' },
    { key: 'commodities', label: 'Commodities' },
    { key: 'amount', label: 'Amount' },
    { key: 'receipt_id', label: 'Receipt No' },
    { key: 'port_check', label: 'Portability' },
    { key: 'login_time', label: 'Login Time' },
    { key: 'trans_time', label: 'Transaction Time' },
    { key: 'auth_time', label: 'Auth Time' },
    { key: 'txn_id', label: 'Txn ID' },
  ];

  // ---- data flow ----
  submit() {
    this.submitting.set(true);
    this.panels.set([]);
    this.api.detailedTransactions(this.date).subscribe({
      next: (env) => {
        this.submitting.set(false);
        this.panels.set([this.metricPanel(0, '', env, {})]);
      },
      error: (e) => {
        this.submitting.set(false);
        this.panels.set([{ level: 0, title: '', monthName: '', date: this.date, rows: [], loading: false, error: this.msg(e), ctx: {} }]);
      },
    });
  }

  /** Click a link in panel p to open the next level. */
  drill(p: Panel, row: Row) {
    if (p.level === 0) {
      const distCode = String(row['dist_code'] ?? '');
      const title = `Detailed Transactions For ${row['dist_name_en'] ?? ''}`;
      this.openChild(p, 1, title, { distCode }, () => this.api.detailedTransOffice(this.date, distCode));
    } else if (p.level === 1) {
      const afsoCode = String(row['afso_code'] ?? '');
      const title = `Detailed Transactions For ${row['afso_name_en'] ?? ''}`;
      this.openChild(p, 2, title, { distCode: p.ctx.distCode, afsoCode }, () =>
        this.api.detailedTransFps(this.date, p.ctx.distCode!, afsoCode));
    } else if (p.level === 2) {
      const fpsId = String(row['fps_id'] ?? '');
      const title = `Transaction Details For FPS ${fpsId}`;
      this.openChild(p, 3, title, { distCode: p.ctx.distCode, afsoCode: p.ctx.afsoCode, fpsId }, () =>
        this.api.detailedTransRc(this.date, p.ctx.distCode!, p.ctx.afsoCode!, fpsId));
    }
  }

  private openChild(
    parent: Panel,
    level: 0 | 1 | 2 | 3,
    title: string,
    ctx: Panel['ctx'],
    call: () => import('rxjs').Observable<DetailedTransEnvelope>
  ) {
    // keep panels up to the parent, add a loading child
    const kept = this.panels().slice(0, parent.level + 1);
    const child: Panel = { level, title, monthName: parent.monthName, date: this.date, rows: [], loading: true, error: '', ctx };
    this.panels.set([...kept, child]);
    call().subscribe({
      next: (env) => this.replaceChild(level, { ...child, loading: false, rows: env.data ?? [], monthName: env.MonthName ?? parent.monthName }),
      error: (e) => this.replaceChild(level, { ...child, loading: false, error: this.msg(e) }),
    });
  }

  private replaceChild(level: number, next: Panel) {
    this.panels.set(this.panels().map((p) => (p.level === level ? next : p)));
  }

  private metricPanel(level: 0 | 1 | 2 | 3, title: string, env: DetailedTransEnvelope, ctx: Panel['ctx']): Panel {
    return { level, title, monthName: env.MonthName ?? '', date: env.date ?? this.date, rows: env.data ?? [], loading: false, error: '', ctx };
  }

  back() {
    if (this.panels().length) this.panels.set([]);
    else this.router.navigate(['/']);
  }

  // ---- display helpers ----
  nameLabel(level: number) { return level === 0 ? 'District' : level === 1 ? 'Office' : 'FPS ID'; }
  name(level: number, row: Row) { return level === 0 ? row['dist_name_en'] : level === 1 ? row['afso_name_en'] : row['fps_id']; }
  n(v: unknown): number { return v == null || v === '' ? 0 : Number(v); }
  num2(v: unknown): string { return v == null ? '0.00' : Number(v).toFixed(2); }
  pct(part: unknown, whole: unknown): string {
    const w = this.n(whole); if (!w) return '0.00';
    return ((this.n(part) * 100) / w).toFixed(2);
  }
  sum(rows: Row[], key: string): number { return rows.reduce((a, r) => a + this.n(r[key]), 0); }

  private msg(e: unknown): string {
    return (e as { error?: { message?: string }; message?: string })?.error?.message
      ?? (e as { message?: string })?.message
      ?? 'Could not load this level. Ensure the dev proxy can reach epos.bihar.gov.in.';
  }

  // ---- Export to Excel (CSV, opens in Excel) ----
  exportMetric(p: Panel) {
    const head = ['Sl.No', this.nameLabel(p.level), ...(p.level === 2 ? ['FPS Name'] : []), 'Total Cards (A)',
      ...this.dateTransKeys.map((_, i) => 'Date ' + this.transSub[i]),
      ...this.dateAvailKeys.map((_, i) => 'Date Availed ' + this.availSub[i]),
      ...this.monthTransKeys.map((_, i) => p.monthName + ' ' + this.transSub[i]),
      ...this.monthAvailKeys.map((_, i) => p.monthName + ' Availed ' + this.availSub[i]),
      'Total Availed %', 'Partial %'];
    const rows = p.rows.map((r, i) => [i + 1, this.name(p.level, r), ...(p.level === 2 ? [r['del_name']] : []), this.n(r['total_cards']),
      ...this.allMetricKeys.map((k) => this.n(r[k])), this.pct(r['total_availed'], r['total_cards']), this.num2(r['partial'])]);
    this.downloadCsv([head, ...rows], (p.title || 'DetailedTransactions') + '.csv');
  }
  exportRc(p: Panel) {
    const head = ['Sl.No', ...this.rcCols.map((c) => c.label)];
    const rows = p.rows.map((r, i) => [i + 1, ...this.rcCols.map((c) => r[c.key])]);
    this.downloadCsv([head, ...rows], (p.title || 'Transactions') + '.csv');
  }
  private downloadCsv(rows: unknown[][], filename: string) {
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
