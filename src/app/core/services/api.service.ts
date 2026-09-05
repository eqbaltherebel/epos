import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActiveMonthYear,
  ApiEnvelope,
  DetailedTransEnvelope,
  FooterInfo,
  HeaderInfo,
  HomeData,
  PublicMenu,
  RightMenu,
  StateName,
} from '../models/api.models';

/**
 * Thin wrapper over the SMART-PDS Spring backend.
 *
 * All paths are relative so that, in development, the Angular dev-server
 * proxy (proxy.conf.json) forwards them to https://epos.bihar.gov.in,
 * avoiding CORS. In production point `apiBase` at a same-origin reverse proxy.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /** Root of the Spring API (kept relative for the dev proxy). */
  readonly apiBase = '/Epos_Spring';

  // ---- Structural ----
  getHeader(langId = 1): Observable<HeaderInfo[]> {
    return this.http.get<HeaderInfo[]>(`${this.apiBase}/demo/getHeader/${langId}`);
  }

  getFooter(langId = 1): Observable<FooterInfo[]> {
    return this.http.get<FooterInfo[]>(`${this.apiBase}/demo/getFooter/${langId}`);
  }

  getHome(): Observable<ApiEnvelope<HomeData>> {
    return this.http.get<ApiEnvelope<HomeData>>(`${this.apiBase}/demo/getHome`);
  }

  getPublicMenus(): Observable<PublicMenu[]> {
    return this.http.get<PublicMenu[]>(`${this.apiBase}/demo/get_Public_Menus`);
  }

  getRightSideMenu(): Observable<RightMenu[]> {
    return this.http.get<RightMenu[]>(`${this.apiBase}/api/getRightSideMenu`);
  }

  getStateName(): Observable<StateName[]> {
    return this.http.get<StateName[]>(`${this.apiBase}/Common/getstatename`);
  }

  currentYear(): Observable<number> {
    return this.http.get<number>(`${this.apiBase}/Common/currentYear`);
  }

  currentMonth(): Observable<number> {
    return this.http.get<number>(`${this.apiBase}/Common/currentMonth`);
  }

  // ---- Shared dropdown data ----
  putMonths(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiBase}/Common/putMonths`);
  }

  putYears(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiBase}/Common/putYears`);
  }

  getDistricts(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiBase}/Common/getDistricts`);
  }

  /** Cascading office (AFSO) list for a district. Endpoint name inferred from the site convention. */
  getOffices(districtCode: string | number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiBase}/Common/getOffices`, {
      params: new HttpParams().set('districtCode', String(districtCode)),
    });
  }

  /** Cascading FPS list for an office. */
  getFps(officeCode: string | number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiBase}/Common/getFps`, {
      params: new HttpParams().set('officeCode', String(officeCode)),
    });
  }

  // ---- Reports ----
  fpsActiveMonthYear(): Observable<ActiveMonthYear> {
    return this.http.get<ActiveMonthYear>(`${this.apiBase}/api/fps/activeMonthYear`);
  }

  fpsSummary(month: number, year: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiBase}/api/fps/fpsSummary`, {
      params: new HttpParams().set('month', month).set('year', year),
    });
  }

  // ---- Detailed Transactions drill-down (verified against production) ----
  // L1 details {date} -> districts; L2 office {date,distCode}; L3 fps {date,distCode,afsoCode};
  // L4 Rc {date,distCode,afsoCode,fpsId}. Envelope: { date?, data:[...], header, MonthName, status }.
  detailedTransactions(date: string): Observable<DetailedTransEnvelope> {
    return this.http.post<DetailedTransEnvelope>(`${this.apiBase}/api/DetailedTrans/details`, { date });
  }
  detailedTransOffice(date: string, distCode: string): Observable<DetailedTransEnvelope> {
    return this.http.post<DetailedTransEnvelope>(`${this.apiBase}/api/DetailedTrans/office`, { date, distCode });
  }
  detailedTransFps(date: string, distCode: string, afsoCode: string): Observable<DetailedTransEnvelope> {
    return this.http.post<DetailedTransEnvelope>(`${this.apiBase}/api/DetailedTrans/fps`, { date, distCode, afsoCode });
  }
  detailedTransRc(date: string, distCode: string, afsoCode: string, fpsId: string): Observable<DetailedTransEnvelope> {
    return this.http.post<DetailedTransEnvelope>(`${this.apiBase}/api/DetailedTrans/Rc`, { date, distCode, afsoCode, fpsId });
  }

  /** Generic GET report. */
  reportGet<T = unknown>(path: string, params?: Record<string, string | number>): Observable<T> {
    let hp = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) hp = hp.set(k, String(v));
    }
    return this.http.get<T>(`${this.apiBase}${path}`, { params: hp });
  }

  /** Generic POST report. */
  reportPost<T = unknown>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiBase}${path}`, body);
  }
}
