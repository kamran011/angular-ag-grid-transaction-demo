/**
 * Production systems expose something like `GET /transactions?startRow=&endRow=&filterModel=&sortModel=`
 * backed by NestJS + a database. AG Grid Enterprise Server-Side Row Model matches that flow.
 *
 * **AG Grid Community** does not include the Server-Side Row Model module (Enterprise). This demo
 * uses the same deterministic `createTransactionRow(index)` you would run on the server, but
 * materializes a client-side array so filters, sort, pagination, and aggregation all work with
 * Community features.
 */
import { DEFAULT_ROW_COUNT, generateTransactionRows, type TransactionRow } from './transaction-row-generator';

export function buildDemoDataset(): TransactionRow[] {
  return generateTransactionRows(DEFAULT_ROW_COUNT);
}

export { DEFAULT_ROW_COUNT };
