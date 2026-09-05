import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { PublicMenu, RightMenu, SideMenuItem } from '../models/api.models';
import { FALLBACK_PUBLIC_MENUS, FALLBACK_RIGHT_MENU } from '../fallback-data';

/** Loads and caches the live navigation data (shared by shell + reports).
 *  Falls back to the bundled structure when the API is unreachable, so the
 *  navigation and every screen stay available even if the backend is down. */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = inject(ApiService);

  readonly publicMenus$: Observable<PublicMenu[]> = this.api.getPublicMenus().pipe(
    map((m) => (Array.isArray(m) && m.length ? m : FALLBACK_PUBLIC_MENUS)),
    catchError(() => of(FALLBACK_PUBLIC_MENUS)),
    shareReplay(1)
  );

  readonly rightMenu$: Observable<RightMenu[]> = this.api.getRightSideMenu().pipe(
    map((m) => (Array.isArray(m) && m.length ? m : FALLBACK_RIGHT_MENU)),
    catchError(() => of(FALLBACK_RIGHT_MENU)),
    shareReplay(1)
  );

  private titleCache: Record<string, string> | null = null;

  /** Build a link -> display title index from the live menus (memoised). */
  indexTitles(publicMenus: PublicMenu[], sideMenu: SideMenuItem[]): Record<string, string> {
    const idx: Record<string, string> = {};
    for (const m of publicMenus) {
      for (const child of m.menu_list) {
        if (child.link) idx[child.link] = child.title || child.name;
      }
      if (m.menu_link && m.menu_link !== '#') idx[m.menu_link] = m.menu_name_eng;
    }
    for (const s of sideMenu) {
      if (s.side_menu_link) idx[s.side_menu_link] = s.side_menu_name_eng;
    }
    this.titleCache = idx;
    return idx;
  }

  lookupTitle(link: string): string | null {
    return this.titleCache?.[link] ?? null;
  }
}
