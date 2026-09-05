import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ReportPageComponent } from './features/report/report-page.component';
import { DetailedTransactionsComponent } from './features/report/detailed-transactions.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  // Detailed Transactions has a bespoke 4-level drill-down (District→Office→FPS→RC).
  { path: 'AbstractTransReport', component: DetailedTransactionsComponent },
  // Every other SMART-PDS report link resolves to the generic, config-driven report page.
  { path: ':link', component: ReportPageComponent },
  { path: '**', redirectTo: '' },
];
