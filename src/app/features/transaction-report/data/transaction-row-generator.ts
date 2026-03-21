/** Deterministic synthetic trade rows — same pattern a NestJS SSRM endpoint would use per row index. */

export interface TransactionRow {
  id: string;
  tradeDate: string;
  valueDate: string;
  amount: number;
  fee: number;
  currency: string;
  bank: string;
  account: string;
  counterparty: string;
  reference: string;
  channel: string;
}

/** Banks with nested accounts — used for grouped distinct filter UI (JD 1.3). */
export const BANK_GROUPS: ReadonlyArray<{ bank: string; accounts: readonly string[] }> = [
  { bank: 'Bank ABC', accounts: ['ACC-ABC-001', 'ACC-ABC-002', 'ACC-ABC-003', 'ACC-ABC-004'] },
  { bank: 'Bank 123', accounts: ['ACC-123-771', 'ACC-123-772', 'ACC-123-773'] },
  { bank: 'Global Trade Bank', accounts: ['GTB-4401', 'GTB-4402', 'GTB-4403', 'GTB-4404', 'GTB-4405'] },
  { bank: 'Northern Credit', accounts: ['NC-9001', 'NC-9002'] },
];

const CHANNELS = ['SWIFT', 'SEPA', 'BOOK', 'WIRE', 'ACH'] as const;
const COUNTERPARTIES = [
  'Acme Corp',
  'Contoso Ltd',
  'Fabrikam SA',
  'Northwind BV',
  'Tailspin LLC',
  'Wide World Importers',
] as const;

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Create one row for a logical index (stable for demos and “server” simulation). */
export function createTransactionRow(index: number): TransactionRow {
  const rng = mulberry32(index * 9973 + 1337);
  const bg = pick(rng, BANK_GROUPS);
  const account = pick(rng, bg.accounts);
  const dayOffset = Math.floor(rng() * 365 * 3);
  const trade = new Date();
  trade.setDate(trade.getDate() - dayOffset);
  const value = new Date(trade);
  value.setDate(value.getDate() + Math.floor(rng() * 3));

  const amount = Math.round((rng() * 2_000_000 - 500_000) * 100) / 100;
  const fee = Math.round(rng() * 500 * 100) / 100;

  return {
    id: `TXN-${index.toString().padStart(8, '0')}`,
    tradeDate: formatDate(trade),
    valueDate: formatDate(value),
    amount,
    fee,
    currency: rng() > 0.85 ? 'EUR' : 'USD',
    bank: bg.bank,
    account,
    counterparty: pick(rng, COUNTERPARTIES),
    reference: `REF-${Math.floor(rng() * 1e9)
      .toString(36)
      .toUpperCase()}-${(index % 10000).toString().padStart(4, '0')}`,
    channel: pick(rng, CHANNELS),
  };
}

/**
 * Client-side materialized dataset. AG Grid Community includes Client + Infinite row models;
 * Server-Side Row Model requires Enterprise. This volume is chosen to stay responsive while
 * demonstrating filters, sort, pagination, and aggregation.
 */
export function generateTransactionRows(count: number): TransactionRow[] {
  const rows: TransactionRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = createTransactionRow(i);
  }
  return rows;
}

export const DEFAULT_ROW_COUNT = 50_000;
