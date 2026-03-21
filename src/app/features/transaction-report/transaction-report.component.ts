import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  FilterChangedEvent,
  FilterModel,
  GridApi,
  GridOptions,
  GridReadyEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AdvancedSearchDialogComponent } from './advanced-search/advanced-search-dialog.component';
import { buildDemoDataset } from './data/fake-server-datasource';
import type { TransactionRow } from './data/transaction-row-generator';
import { AccountGroupFilterComponent } from './filters/account-group-filter.component';
import { createTransactionColumnDefs } from './grid/transaction-grid.config';

@Component({
  selector: 'app-transaction-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AgGridAngular, AdvancedSearchDialogComponent],
  templateUrl: './transaction-report.component.html',
  styleUrl: './transaction-report.component.scss',
})
export class TransactionReportComponent {
  private readonly advancedDialog = viewChild.required(AdvancedSearchDialogComponent);

  protected readonly rowData: TransactionRow[] = buildDemoDataset();

  protected readonly gridApi = signal<GridApi<TransactionRow> | undefined>(undefined);

  protected readonly quickFilterDraft = signal('');
  private readonly quickFilterDebounced = new Subject<string>();

  protected readonly aggType = signal<'sum' | 'avg' | 'max' | 'min'>('sum');
  protected readonly aggAmount = signal(true);
  protected readonly aggFee = signal(true);
  protected readonly aggResult = signal<Record<string, number | null>>({});
  protected readonly filteredRowCount = signal(0);

  protected readonly gridOptions: GridOptions<TransactionRow> = {
    columnDefs: createTransactionColumnDefs(),
    defaultColDef: {
      sortable: true,
      filter: true,
      floatingFilter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    },
    components: {
      accountGroupFilter: AccountGroupFilterComponent,
    },
    rowModelType: 'clientSide',
    animateRows: true,
    pagination: true,
    paginationPageSize: 100,
    paginationPageSizeSelector: [50, 100, 500, 1000],
    getRowId: (p) => p.data.id,
    onGridReady: (e) => this.handleGridReady(e),
    onFilterChanged: (e) => this.handleFilterChanged(e),
    onSortChanged: (e) => this.handleSortChanged(e),
  };

  constructor() {
    this.quickFilterDebounced
      .pipe(debounceTime(220), takeUntilDestroyed())
      .subscribe((q) => {
        const api = this.gridApi();
        if (!api) return;
        api.setGridOption('quickFilterText', q);
      });
  }

  protected onQuickFilterInput(value: string): void {
    this.quickFilterDraft.set(value);
    this.quickFilterDebounced.next(value);
  }

  protected openAdvanced(): void {
    this.advancedDialog().show();
  }

  protected onAdvancedApply(model: FilterModel): void {
    const api = this.gridApi();
    if (!api) return;
    const cur = api.getFilterModel() ?? {};
    api.setFilterModel({ ...cur, ...model });
    api.paginationGoToFirstPage();
    this.refreshAgg();
  }

  protected onAggChange(): void {
    this.refreshAgg();
  }

  private handleGridReady(e: GridReadyEvent<TransactionRow>): void {
    this.gridApi.set(e.api);
    this.refreshAgg();
  }

  private handleFilterChanged(_e: FilterChangedEvent): void {
    const api = this.gridApi();
    if (!api) return;
    api.paginationGoToFirstPage();
    this.refreshAgg();
  }

  private handleSortChanged(_e: SortChangedEvent): void {
    const api = this.gridApi();
    if (!api) return;
    api.paginationGoToFirstPage();
    this.refreshAgg();
  }

  private refreshAgg(): void {
    const api = this.gridApi();
    if (!api) {
      this.aggResult.set({});
      this.filteredRowCount.set(0);
      return;
    }

    let n = 0;
    const keys: Array<'amount' | 'fee'> = [];
    if (this.aggAmount()) keys.push('amount');
    if (this.aggFee()) keys.push('fee');

    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    const mins: Record<string, number> = {};
    const maxs: Record<string, number> = {};
    for (const k of keys) {
      sums[k] = 0;
      counts[k] = 0;
      mins[k] = Number.POSITIVE_INFINITY;
      maxs[k] = Number.NEGATIVE_INFINITY;
    }

    api.forEachNodeAfterFilterAndSort((node) => {
      const d = node.data;
      if (!d) return;
      n++;
      for (const k of keys) {
        const v = d[k];
        sums[k] += v;
        counts[k]++;
        mins[k] = Math.min(mins[k], v);
        maxs[k] = Math.max(maxs[k], v);
      }
    });

    this.filteredRowCount.set(n);

    const t = this.aggType();
    const result: Record<string, number | null> = {};
    for (const k of keys) {
      if (counts[k] === 0) {
        result[k] = null;
        continue;
      }
      if (t === 'sum') result[k] = sums[k];
      else if (t === 'avg') result[k] = sums[k] / counts[k];
      else if (t === 'min') result[k] = mins[k];
      else result[k] = maxs[k];
    }
    this.aggResult.set(result);
  }
}
