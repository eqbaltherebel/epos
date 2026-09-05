/**
 * Interfaces for the epos.bihar.gov.in (SMART-PDS / AePDS) Spring backend,
 * derived from the live /Epos_Spring/* responses.
 */

/* ---------- Common ---------- */
export interface ApiEnvelope<T> {
  rep_code: string;
  rep_message: string;
  data: T;
  heading?: string;
}

export interface SpringError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface StateName {
  state_name_en: string;
  state_code: string;
}

export interface ActiveMonthYear {
  month: number;
  year: number;
}

/* ---------- Header / Footer ---------- */
/** getHeader/1 returns headings plus base64-encoded logos whose exact keys vary,
 *  so we keep it open and detect logo fields at render time. */
export type HeaderInfo = Record<string, unknown> & {
  language_id?: number;
  state_code?: number;
  heading_1?: string;
  heading_2?: string;
  heading_3?: string;
};

export type FooterInfo = Record<string, unknown>;

/* ---------- Home ---------- */
export interface SideMenuItem {
  side_menu_id: number;
  side_menu_name_eng: string;
  side_menu_link: string;
  side_manu_target?: string;
  side_menu_status: string;
  side_menu_new: string; // may contain an <img> "new" gif snippet
  side_menu_name_hi: string;
}

export interface EposTransLive {
  total_shops: string;
  total_cards: string;
  avail_cards: string;
  port_cards: string;
  active_shops: string;
  total_trans: string;
  todays_trans: string;
  total_units: string;
  month_wheat: string;
  month_rice: string;
  impds_cards: string;
  update_time: string;
  grand_per: number;
  month: string;
  refresh_time: string;
  year: number;
}

export interface HomeData {
  side_menu: SideMenuItem[];
  getEposTransLive: EposTransLive[];
  getHitCount: number;
}

/* ---------- Top navigation (mega menu) ---------- */
export interface PublicMenuChild {
  lid: number;
  name: string;
  link: string;
  weight: number;
  title: string | null;
  status: string;
  name_hi: string | null;
  public_menu_new: string | null;
}

export interface PublicMenu {
  menu_id: number;
  menu_name_eng: string;
  menu_name_hi: string;
  menu_link: string;
  menu_target: string;
  menu_list: PublicMenuChild[];
}

/* ---------- Right accordion ---------- */
export interface RightMenuItemData {
  sno: number;
  mid: number;
  data: string | null;
  links: string | null;
  mail: string | null;
  tollfree: string | null;
  imgUrl: string | null;
}

export interface RightMenu {
  side_menu_id: number;
  side_menu_name_eng: string;
  side_menu_link: string;
  side_menu_target: string;
  side_menu_status: string;
  side_menu_new: string; // hex colour string, e.g. "#cc0066"
  side_menu_name_hi: string;
  items: RightMenuItemData[];
}

/* ---------- Generic report result ---------- */
/** Report endpoints return heterogeneous JSON. We normalise to a
 *  columns + rows table for the generic renderer. */
export interface ReportTable {
  columns: string[];
  rows: Array<Record<string, unknown>>;
}

/** Envelope returned by the DetailedTrans drill-down endpoints. */
export interface DetailedTransEnvelope {
  date?: string;
  data: Array<Record<string, unknown>>;
  header?: string;
  MonthName?: string;
  status?: number;
  message?: string;
}
