import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { EposTransLive } from '../../core/models/api.models';

interface Cell {
  label: string;
  value: string;
}

/** The black "PDS Transactions" live-stats board with seven-segment numerals. */
@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-black p-3 text-center">
      <h3 class="mb-2 inline-block border-b border-orange-400/60 px-4 pb-1 text-lg font-bold text-white">
        PDS Transactions - {{ stat()?.month }} ' {{ stat()?.year }}
      </h3>

      <div class="grid grid-cols-3">
        @for (c of cells(); track c.label) {
          <div class="min-w-0 overflow-hidden px-1 py-2 sm:px-2">
            <div class="text-xs font-semibold text-orange-400 sm:text-sm">{{ c.label }}</div>
            <div class="epos-digital truncate text-base leading-tight text-[#f5efe0] sm:text-2xl">{{ c.value }}</div>
          </div>
        }
      </div>

      <div class="mt-1 text-right text-xs font-semibold">
        <span class="text-white">Last Refreshed : </span>
        <span class="text-green-400">{{ stat()?.refresh_time }}</span>
      </div>
    </div>
  `,
})
export class StatsDashboardComponent {
  stat = input<EposTransLive | null>(null);

  cells = computed<Cell[]>(() => {
    const s = this.stat();
    if (!s) return [];
    return [
      { label: 'Total Cards', value: s.total_cards },
      { label: 'Availed Cards', value: s.avail_cards },
      { label: 'Portability Cards', value: s.port_cards },
      { label: 'Total Shops', value: s.total_shops },
      { label: 'Active Shops', value: s.active_shops },
      { label: 'Month Trans %', value: this.fmtPercent(s.grand_per) },
      { label: 'Month Trans', value: s.total_trans },
      { label: 'Todays Trans', value: s.todays_trans },
      { label: 'IMPDS Cards', value: s.impds_cards },
    ];
  });

  private fmtPercent(v: number | undefined): string {
    if (v == null || isNaN(v)) return '0.00';
    return v.toFixed(2);
  }
}
