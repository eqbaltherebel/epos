/**
 * Report registry.
 *
 * Every route link that appears in the live menus resolves to a ReportConfig.
 * `filter` controls which filter form the generic report page renders;
 * `fetch` (when present and confirmed against the live server) makes the
 * report return real data. Links without a confirmed `fetch` still render a
 * faithful, fully-live filter form (month/year/district dropdowns hit the real
 * endpoints); their result endpoint is resolved against the live backend.
 */

export type FilterKind =
  | 'none'
  | 'date'
  | 'monthYear'
  | 'district'
  | 'monthYearDistrict';

export interface ReportFetch {
  method: 'GET' | 'POST';
  /** Path under /Epos_Spring, confirmed against the live site. */
  path: string;
  confirmed: boolean;
}

export interface ReportConfig {
  /** Fallback title if the link is not found in the live menus. */
  title?: string;
  filter: FilterKind;
  fetch?: ReportFetch;
  /** Optional fixed column order for confirmed reports. */
  note?: string;
}

/** Confirmed / specially handled reports. */
export const REPORT_REGISTRY: Record<string, ReportConfig> = {
  AbstractTransReport: {
    title: 'Detailed Transactions',
    filter: 'date',
    fetch: { method: 'POST', path: '/api/DetailedTrans/details', confirmed: true },
  },
  dfso_fps_details: {
    title: 'FPS Details',
    filter: 'none',
    fetch: { method: 'GET', path: '/api/fps/fpsSummary', confirmed: true },
  },
  Stock_Register_Int: {
    title: 'Stock Details',
    filter: 'monthYearDistrict',
  },
  Scheme_Sale_Interface: { title: 'Scheme Wise Sales', filter: 'monthYearDistrict' },
  Stock_Interface: { title: 'Stock Abstract', filter: 'monthYear' },
  Portability_Interface: { title: 'Portability Details', filter: 'date' },
  FPS_Stock: { title: 'FPS Stock Register', filter: 'monthYearDistrict' },
  FPS_Status: { title: 'FPS Status', filter: 'monthYearDistrict' },
  per_status: { title: '% Distribution Status', filter: 'monthYear' },
  Pmgkay_Int: { title: 'PMGKAY', filter: 'monthYear' },
  active_inactive: { title: 'Active Inactive Shops', filter: 'monthYear' },
};

/** The most common filter shape on the portal. */
const DEFAULT_FILTER: FilterKind = 'monthYearDistrict';

export function getReportConfig(link: string): ReportConfig {
  return REPORT_REGISTRY[link] ?? { filter: DEFAULT_FILTER };
}
