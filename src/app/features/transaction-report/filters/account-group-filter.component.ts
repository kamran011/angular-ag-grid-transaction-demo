import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { IFilterAngularComp } from 'ag-grid-angular';
import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { BANK_GROUPS, type TransactionRow } from '../data/transaction-row-generator';

export interface AccountGroupFilterModel {
  accountId: string;
}

@Component({
  selector: 'app-account-group-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="account-filter">
      <label class="account-filter__label">Account (grouped by bank)</label>
      <select
        class="account-filter__select"
        [value]="selected()"
        (change)="onChange($any($event.target).value)"
      >
        <option value="">All accounts</option>
        @for (g of groups; track g.bank) {
          <optgroup [label]="g.bank">
            @for (acc of g.accounts; track acc) {
              <option [value]="acc">{{ acc }}</option>
            }
          </optgroup>
        }
      </select>
    </div>
  `,
  styles: `
    .account-filter {
      padding: 8px 10px;
      min-width: 240px;
    }
    .account-filter__label {
      display: block;
      font-size: 11px;
      margin-bottom: 6px;
      color: var(--ag-secondary-foreground-color, #666);
    }
    .account-filter__select {
      width: 100%;
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid var(--ag-border-color, #ccc);
      font: inherit;
    }
  `,
})
export class AccountGroupFilterComponent implements IFilterAngularComp {
  readonly groups = BANK_GROUPS;
  private params!: IFilterParams<TransactionRow>;
  readonly selected = signal('');

  agInit(params: IFilterParams<TransactionRow>): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.selected() !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams<TransactionRow>): boolean {
    const v = this.selected();
    if (!v) return true;
    return params.data.account === v;
  }

  getModel(): AccountGroupFilterModel | null {
    if (!this.isFilterActive()) return null;
    return { accountId: this.selected() };
  }

  setModel(model: AccountGroupFilterModel | null): void {
    this.selected.set(model?.accountId ?? '');
  }

  onChange(value: string): void {
    this.selected.set(value);
    this.params.filterChangedCallback();
  }
}
