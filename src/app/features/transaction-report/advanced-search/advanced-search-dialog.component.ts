import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DateFilterModel, FilterModel, NumberFilterModel, TextFilterModel } from 'ag-grid-community';

@Component({
  selector: 'app-advanced-search-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div class="dialog-backdrop" (click)="close()">
        <div class="dialog" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <header class="dialog__head">
            <h2 class="dialog__title">Advanced search</h2>
            <button type="button" class="dialog__x" (click)="close()" aria-label="Close">×</button>
          </header>
          <p class="dialog__hint">
            Combine date range, amount range, and counterparty text. Maps to AG Grid column filters (equals /
            between / etc.).
          </p>
          <div class="dialog__grid">
            <label class="field">
              <span>Trade date from</span>
              <input type="date" name="df" [(ngModel)]="dateFrom" />
            </label>
            <label class="field">
              <span>Trade date to</span>
              <input type="date" name="dt" [(ngModel)]="dateTo" />
            </label>
            <label class="field">
              <span>Amount min</span>
              <input type="number" name="amin" [(ngModel)]="amountMin" placeholder="e.g. -100000" />
            </label>
            <label class="field">
              <span>Amount max</span>
              <input type="number" name="amax" [(ngModel)]="amountMax" placeholder="e.g. 500000" />
            </label>
            <label class="field field--wide">
              <span>Counterparty contains</span>
              <input type="text" name="cp" [(ngModel)]="counterparty" placeholder="Optional" />
            </label>
          </div>
          <footer class="dialog__foot">
            <button type="button" class="btn btn--ghost" (click)="clear()">Clear fields</button>
            <button type="button" class="btn btn--primary" (click)="apply()">Apply to grid</button>
          </footer>
        </div>
      </div>
    }
  `,
  styles: `
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .dialog {
      background: #fff;
      border-radius: 10px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
      border: 1px solid #e2e8f0;
    }
    .dialog__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px 0;
    }
    .dialog__title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }
    .dialog__x {
      border: none;
      background: transparent;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      color: #64748b;
    }
    .dialog__hint {
      margin: 8px 18px 12px;
      font-size: 0.875rem;
      color: #64748b;
    }
    .dialog__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 16px;
      padding: 0 18px 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.8rem;
      color: #475569;
    }
    .field--wide {
      grid-column: 1 / -1;
    }
    .field input {
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font: inherit;
    }
    .dialog__foot {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 18px 18px;
      border-top: 1px solid #e2e8f0;
    }
    .btn {
      border-radius: 6px;
      padding: 8px 14px;
      font: inherit;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn--ghost {
      background: #fff;
      border-color: #cbd5e1;
      color: #334155;
    }
    .btn--primary {
      background: #0f766e;
      color: #fff;
    }
    .btn--primary:hover {
      background: #0d9488;
    }
  `,
})
export class AdvancedSearchDialogComponent {
  readonly applyModel = output<FilterModel>();

  protected readonly open = signal(false);

  dateFrom = '';
  dateTo = '';
  amountMin: number | null = null;
  amountMax: number | null = null;
  counterparty = '';

  show(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  clear(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.amountMin = null;
    this.amountMax = null;
    this.counterparty = '';
  }

  apply(): void {
    const model: FilterModel = {};

    if (this.dateFrom && this.dateTo) {
      const dm: DateFilterModel = {
        filterType: 'date',
        type: 'inRange',
        dateFrom: `${this.dateFrom} 00:00:00`,
        dateTo: `${this.dateTo} 23:59:59`,
      };
      model['tradeDate'] = dm;
    }

    if (this.amountMin != null && this.amountMax != null && this.amountMin <= this.amountMax) {
      const nm: NumberFilterModel = {
        filterType: 'number',
        type: 'inRange',
        filter: this.amountMin,
        filterTo: this.amountMax,
      };
      model['amount'] = nm;
    }

    const cp = this.counterparty.trim();
    if (cp.length > 0) {
      const tm: TextFilterModel = {
        filterType: 'text',
        type: 'contains',
        filter: cp,
      };
      model['counterparty'] = tm;
    }

    this.applyModel.emit(model);
    this.close();
  }
}
