import type { ColDef, IDateComparatorFunc, TextMatcherParams } from 'ag-grid-community';
import type { TransactionRow } from '../data/transaction-row-generator';

/** JD 1.2: refine only after 3+ typed characters (shorter input does not narrow the set). */
export function minThreeCharTextMatcher(params: TextMatcherParams): boolean {
  const t = (params.filterText ?? '').trim();
  if (t.length === 0) return true;
  if (t.length < 3) return true;
  const cell = (params.value ?? '').toString().toLowerCase();
  const f = t.toLowerCase();
  switch (params.filterOption) {
    case 'equals':
      return cell === f;
    case 'startsWith':
      return cell.startsWith(f);
    case 'endsWith':
      return cell.endsWith(f);
    case 'notContains':
      return !cell.includes(f);
    case 'notEqual':
      return cell !== f;
    default:
      return cell.includes(f);
  }
}

const tradeDateComparator: IDateComparatorFunc = (filterLocalDateAtMidnight, cellValue) => {
  if (cellValue == null || cellValue === '') return -1;
  const cell = new Date(String(cellValue) + 'T12:00:00').getTime();
  const f = filterLocalDateAtMidnight.getTime();
  if (cell < f) return -1;
  if (cell > f) return 1;
  return 0;
};

export function createTransactionColumnDefs(): ColDef<TransactionRow>[] {
  return [
    {
      field: 'id',
      headerName: 'Transaction ID',
      width: 150,
      maxWidth: 180,
      filter: 'agTextColumnFilter',
      filterParams: { debounceMs: 250, filterOptions: ['contains', 'equals', 'startsWith'] },
    },
    {
      field: 'tradeDate',
      headerName: 'Trade date',
      width: 140,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: tradeDateComparator,
        filterOptions: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange'],
        debounceMs: 250,
      },
    },
    {
      field: 'valueDate',
      headerName: 'Value date',
      width: 140,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: tradeDateComparator,
        filterOptions: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange'],
        debounceMs: 250,
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      filterParams: {
        filterOptions: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange'],
        allowedCharPattern: '\\d\\-\\.\\,',
        debounceMs: 250,
      },
      valueFormatter: (p) =>
        p.value == null ? '' : `${Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      field: 'fee',
      headerName: 'Fee',
      width: 120,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      filterParams: {
        filterOptions: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange'],
        allowedCharPattern: '\\d\\-\\.\\,',
        debounceMs: 250,
      },
      valueFormatter: (p) =>
        p.value == null ? '' : `${Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      field: 'currency',
      headerName: 'Ccy',
      width: 90,
      maxWidth: 100,
      filter: 'agTextColumnFilter',
      filterParams: { debounceMs: 200, filterOptions: ['equals'] },
    },
    {
      field: 'bank',
      headerName: 'Bank',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      filterParams: { debounceMs: 250, filterOptions: ['contains', 'equals', 'startsWith'] },
    },
    {
      colId: 'account',
      field: 'account',
      headerName: 'Account',
      minWidth: 150,
      filter: 'accountGroupFilter',
      floatingFilter: false,
    },
    {
      field: 'counterparty',
      headerName: 'Counterparty',
      minWidth: 160,
      filter: 'agTextColumnFilter',
      filterParams: {
        debounceMs: 300,
        filterOptions: ['contains', 'equals', 'startsWith'],
        textMatcher: minThreeCharTextMatcher,
      },
    },
    {
      field: 'reference',
      headerName: 'Reference',
      minWidth: 180,
      filter: 'agTextColumnFilter',
      filterParams: {
        debounceMs: 300,
        filterOptions: ['contains', 'equals', 'startsWith'],
        textMatcher: minThreeCharTextMatcher,
      },
    },
    {
      field: 'channel',
      headerName: 'Channel',
      width: 110,
      filter: 'agTextColumnFilter',
      filterParams: { debounceMs: 200, filterOptions: ['equals', 'contains'] },
    },
  ];
}
