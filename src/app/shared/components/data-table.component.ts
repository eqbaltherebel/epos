import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { humanize } from '../../core/services/util';

/** Generic, responsive report table with a Sl.No column and totals-aware styling. */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (rows().length) {
      <div class="overflow-x-auto">
        <table class="epos-table">
          <thead>
            <tr>
              @if (autoIndex()) { <th style="width:56px">Sl.No</th> }
              @for (c of columns(); track c) {
                <th>{{ label(c) }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track $index) {
              <tr>
                @if (autoIndex()) { <td class="text-center">{{ $index + 1 }}</td> }
                @for (c of columns(); track c) {
                  <td [class.text-right]="isNumeric(row[c])">{{ display(row[c]) }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <p class="py-8 text-center text-sm text-gray-500">No records found.</p>
    }
  `,
})
export class DataTableComponent {
  columns = input<string[]>([]);
  rows = input<Array<Record<string, unknown>>>([]);
  showIndex = input(true);

  private serialRe = /^(sno|slno|sl[_.]?no|s[_.]?no|serial|sr[_.]?no)$/i;

  /** True when a serial column already exists in the data. */
  private hasSerial = computed(() => this.columns().some((c) => this.serialRe.test(c)));

  /** Only add an auto index column when the data has none of its own. */
  autoIndex = computed(() => this.showIndex() && !this.hasSerial());

  private labels = computed(() => {
    const m: Record<string, string> = {};
    for (const c of this.columns()) m[c] = this.serialRe.test(c) ? 'Sl.No' : humanize(c);
    return m;
  });

  label(c: string): string {
    return this.labels()[c] ?? c;
  }

  isNumeric(v: unknown): boolean {
    if (typeof v === 'number') return true;
    if (typeof v === 'string') return /^-?[\d,]+(\.\d+)?$/.test(v.trim()) && v.trim() !== '';
    return false;
  }

  display(v: unknown): string {
    if (v == null) return '';
    return String(v);
  }
}
