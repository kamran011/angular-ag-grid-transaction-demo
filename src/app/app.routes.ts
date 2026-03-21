import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/transaction-report/transaction-report.component').then(
        (m) => m.TransactionReportComponent,
      ),
  },
];
