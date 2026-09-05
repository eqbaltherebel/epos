import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { normalizeOptions, Option } from '../../core/services/util';
import { FilterKind } from '../../core/reports.registry';
import { FALLBACK_DISTRICTS } from '../../core/fallback-data';

export interface ReportFilterValue {
  date?: string;
  month?: string;
  year?: string;
  district?: string;
  office?: string;
  fps?: string;
}

@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-3 py-3">
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        @if (kind === 'date') {
          <label class="font-semibold text-gray-700">Date</label>
          <input type="date" class="rounded border border-gray-300 px-2 py-1 text-sm" [(ngModel)]="value.date" />
        }

        @if (kind === 'monthYear' || kind === 'monthYearDistrict') {
          <label class="font-semibold text-gray-700">Month</label>
          <select class="rounded border border-gray-300 px-2 py-1 text-sm" [(ngModel)]="value.month">
            @for (m of months(); track m.value) { <option [value]="m.value">{{ m.label }}</option> }
          </select>
          <label class="font-semibold text-gray-700">Year</label>
          <select class="rounded border border-gray-300 px-2 py-1 text-sm" [(ngModel)]="value.year">
            @for (y of years(); track y.value) { <option [value]="y.value">{{ y.label }}</option> }
          </select>
        }

        @if (kind === 'district' || kind === 'monthYearDistrict') {
          <label class="font-semibold text-gray-700">District</label>
          <select class="min-w-[9rem] rounded border border-gray-300 px-2 py-1 text-sm"
                  [(ngModel)]="value.district" (ngModelChange)="onDistrict($event)">
            @for (d of districts(); track d.value) { <option [value]="d.value">{{ d.label }}</option> }
          </select>
          <label class="font-semibold text-gray-700">AFSO</label>
          <select class="min-w-[6rem] rounded border border-gray-300 px-2 py-1 text-sm"
                  [(ngModel)]="value.office" (ngModelChange)="onOffice($event)" [disabled]="!offices().length">
            <option value="">--select--</option>
            @for (o of offices(); track o.value) { <option [value]="o.value">{{ o.label }}</option> }
          </select>
          <label class="font-semibold text-gray-700">FPS</label>
          <select class="min-w-[6rem] rounded border border-gray-300 px-2 py-1 text-sm"
                  [(ngModel)]="value.fps" [disabled]="!fpsList().length">
            <option value="">--select--</option>
            @for (f of fpsList(); track f.value) { <option [value]="f.value">{{ f.label }}</option> }
          </select>
        }
      </div>

      <div class="mt-3 flex justify-center gap-2">
        <button class="epos-btn" (click)="submit()">Submit</button>
        <button class="epos-btn" (click)="back()">Back</button>
      </div>
    </div>
  `,
})
export class ReportFilterComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  @Input() kind: FilterKind = 'monthYearDistrict';
  @Output() search = new EventEmitter<ReportFilterValue>();

  value: ReportFilterValue = {};

  months = signal<Option[]>([]);
  years = signal<Option[]>([]);
  districts = signal<Option[]>([]);
  offices = signal<Option[]>([]);
  fpsList = signal<Option[]>([]);

  ngOnInit() {
    const today = new Date();
    this.value.date = today.toISOString().slice(0, 10);

    if (this.kind === 'monthYear' || this.kind === 'monthYearDistrict') {
      this.api.putMonths().pipe(catchError(() => of([]))).subscribe((raw) => {
        const opts = normalizeOptions(raw as unknown[]);
        // month endpoints return names; map to 1-based numbers
        const mapped = opts.map((o, i) => ({ value: String(i + 1), label: o.label }));
        this.months.set(mapped.length ? mapped : this.fallbackMonths());
        if (!this.value.month) this.value.month = String(today.getMonth() + 1);
      });
      this.api.putYears().pipe(catchError(() => of([]))).subscribe((raw) => {
        const opts = normalizeOptions(raw as unknown[]);
        this.years.set(opts.length ? opts : this.fallbackYears());
        if (!this.value.year) this.value.year = String(today.getFullYear());
      });
    }

    if (this.kind === 'district' || this.kind === 'monthYearDistrict') {
      this.api.getDistricts().pipe(catchError(() => of([]))).subscribe((raw) => {
        const opts = normalizeOptions(raw as unknown[]);
        this.districts.set(opts.length ? opts : FALLBACK_DISTRICTS);
      });
    }
  }

  onDistrict(code: string) {
    this.value.office = '';
    this.value.fps = '';
    this.offices.set([]);
    this.fpsList.set([]);
    if (!code || code === '--select--') return;
    this.api.getOffices(code).pipe(catchError(() => of([]))).subscribe((raw) => {
      this.offices.set(normalizeOptions(raw as unknown[]));
    });
  }

  onOffice(code: string) {
    this.value.fps = '';
    this.fpsList.set([]);
    if (!code) return;
    this.api.getFps(code).pipe(catchError(() => of([]))).subscribe((raw) => {
      this.fpsList.set(normalizeOptions(raw as unknown[]));
    });
  }

  submit() {
    this.search.emit({ ...this.value });
  }
  back() {
    this.router.navigate(['/']);
  }

  private fallbackMonths(): Option[] {
    return ['January','February','March','April','May','June','July','August','September','October','November','December']
      .map((m, i) => ({ value: String(i + 1), label: m }));
  }
  private fallbackYears(): Option[] {
    const y = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => String(y - i)).map((v) => ({ value: v, label: v }));
  }
}
