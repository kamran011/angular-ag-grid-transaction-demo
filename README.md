# Trade transaction report — Angular + AG Grid Community

**Repository:** [https://github.com/kamran011/angular-ag-grid-transaction-demo](https://github.com/kamran011/angular-ag-grid-transaction-demo)

Angular **20** showcase aligned with a typical **bank / trade reporting** job description: large client-side datasets, rich filters, quick search, advanced multi-field search, multi-column sort, pagination that resets when the model changes, and **Sum / Average / Max / Min** over the **filtered** row set.

## Quick start

```bash
npm install
npm start
```

Open `http://localhost:4200/`. Production build:

```bash
npm run build
```

## Stack

- [Angular](https://angular.dev/) 20 (standalone components, signals)
- [AG Grid Community](https://www.ag-grid.com/angular-data-grid/) (no Enterprise license)
- Themes: Quartz (`ag-theme-quartz`)

## Job description feature checklist

| JD item | What this repo demonstrates |
|--------|------------------------------|
| **1.1** Advanced column filters | Number (`equals`, `between`, `>`, `<`), date (`inRange`, etc.), text filters; floating filters on columns that use them. |
| **1.2** Fast typing filters | **Counterparty** and **Reference** use a custom `textMatcher`: filtering only refines after **3+ characters** (shorter input leaves rows visible). Debounced inputs (`debounceMs`). |
| **1.3** Distinct values grouped | **Account** uses a custom filter with `<optgroup>` — accounts grouped under **bank** (Community has no Enterprise Set Filter). |
| **2** Sort + multi-sort | Column sort; multi-sort via **Shift+click** on headers (AG Grid default; `suppressMultiSort` is not enabled). |
| **3.1** Single search term | Toolbar **Quick search** → `quickFilterText` with **220ms** debounce. |
| **3.2** Advanced search | Dialog applies combined **date range**, **amount range**, and **counterparty contains** via `api.setFilterModel()` (merged with existing column filters). |
| **4** Pagination reset | On **filter** and **sort** changes, `paginationGoToFirstPage()` runs. Quick search updates the filter model and triggers the same path. |
| **5** Footer aggregation | Dropdown for **Sum / Average / Max / Min** and checkboxes for **Amount** and **Fee**; values computed over **`forEachNodeAfterFilterAndSort`** (full filtered set, not only the current page). |

## Scale & row model (important)

- **AG Grid Community** includes **Client-Side** and **Infinite** row models. **Server-Side Row Model** is an **Enterprise** feature.
- This demo **materializes 50,000 deterministic rows** in the browser so **Community** filters, sort, pagination, and aggregation behave like a real app. The same `createTransactionRow(index)` logic is what you would run **per row** in a **NestJS** API behind SSRM.
- For **millions** of rows in production, use **Enterprise SSRM** or a **custom backend + Infinite** datasource with server-side filtering — see [AG Grid row models](https://www.ag-grid.com/angular-data-grid/row-models/).

## Publish to GitHub (`kamran011`)

Repo: [angular-ag-grid-transaction-demo](https://github.com/kamran011/angular-ag-grid-transaction-demo).

From this project folder (after you click **Create repository** on GitHub):

```bash
git remote add origin https://github.com/kamran011/angular-ag-grid-transaction-demo.git
git branch -M main
git add -A && git commit -m "docs: set canonical GitHub URL"   # if you have local README changes
git push -u origin main
```

If `git remote add` fails because `origin` already exists: `git remote set-url origin https://github.com/kamran011/angular-ag-grid-transaction-demo.git`

## License

MIT
