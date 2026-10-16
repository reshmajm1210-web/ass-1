# Shipping Bill Studio

A refactor of the **Shipping Bill creation form** from
[`Bharat-Aaj-Kal/assignment-01`](https://github.com/Bharat-Aaj-Kal/assignment-01).

The starter's form works, but everything lived in one 1,700-line component that mixed
markup, form state, validation, mock data and HTTP-ish calls. This version keeps the same
screens and the same fields, and reorganises them so another engineer can read, test and
extend the feature without touching a monolith.

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm test           # node --test (57 unit tests, no test framework added)
npm run build      # typecheck + vite build
```

Requires Node 22.6+ (the tests run on Node's built-in type stripping, so no test runner or
transpiler is needed). **No dependency was added** — the app uses `react`, `react-dom`,
`vite` and `typescript` only.

---

## Why the shop was rebuilt rather than patched

The starter depends on a **private submodule** (`fe-zen-arch`, packages `core`, `ui`,
`icons`) for its form engine (React Hook Form), state (Zustand), data fetching (React
Query), router, toast manager and Tailwind styling. Without that submodule the project
cannot install, build or run — and the submodule cannot be shared with reviewers.

The assignment explicitly allows this: *"You may reorganize or replace implementations
where justified; prioritize practical improvements over large rewrites."* So the four
capabilities the app actually uses were replaced with small, in-repo modules (custom form
state, custom history router, toast context, plain CSS tokens), and everything else was
kept: screens, fields, conditional rules, messages, payload shape and flat-file output.

---

## Architecture

```
src/
├── domain/shipping-bill/       Business rules — no React, no services
│   ├── types.ts                Form values, parties, ports, bills
│   ├── defaults.ts             emptyBill() / emptyInvoice() / emptyItem()
│   ├── calculations.ts         line/invoice totals, port→country, epoch dates
│   ├── validation.ts           validateBill() → { 'invoices.0.items.0.quantity': '…' }
│   ├── payload.ts              Form values → snake_case save payload (one mapper)
│   ├── flat-file.ts            ICEGATE-style .sb flat file
│   └── *.test.ts               43 domain tests
│
├── services/                   Data access — the only place data comes from
│   ├── party-service.ts        search/get/create exporters, businesses, branches
│   ├── port-service.ts         loading ports, destination ports, lookups
│   ├── reference-data-service.ts  code lists + document/file-type/marks searches
│   ├── shipping-bill-service.ts   list, get, save, flat-file download
│   ├── services.test.ts        14 service tests (including failure injection)
│   └── mock/                   latency simulation, seed data, the mock store
│
├── state/use-async-data.ts     One hook for every async read (loading/error/retry)
├── forms/paths.ts              Immutable get/set/append/remove by dot path
├── ui/                         Button, Input, Select, Checkbox, Field, Card, Tabs,
│                               Dialog, Collapsible, AsyncCombobox, AsyncSelect, …
├── app/                        Router, routes, layout, theme, toast, entry point
└── features/
    ├── dashboard/              Bill list: stats, search, flat-file download
    └── shipping-bill/          The form: page → form shell → sections → fields
```

**Data flow (one direction):**

```
UI component → services/*.ts (Promise) → services/mock/store.ts → localStorage
       ↑                                          │
       └── useAsyncData / useBillForm  ←──────────┘
```

Components never import seed data or reference arrays. Replacing a mock service body with
`fetch('/api/…')` is a one-file change; no component knows the difference.

### Form state

Values live in a single object owned by `BillFormProvider`. Every edit goes through
`setPath` / `appendRow` / `removeRow`, which clone only the branches along the changed
path. Validation is *derived* from the current values once the user has attempted a
submit, so a corrected field clears its error immediately and a pristine form never shows
red. Error keys are the same dot paths used for editing (`invoices.0.items.1.quantity`),
which is also how the form jumps to the first tab with problems after a failed submit.

---

## Before → after

| Starter | Here | Why |
| --- | --- | --- |
| `shipping-bill-form.tsx` — 1,761 lines, all screens + state + rules | `features/shipping-bill/` split into page → shell → 6 sections → field components | One file, one responsibility; sections are independently readable |
| Hardcoded arrays imported straight into the component (`src/data/*`) | Fetched once per form through `reference-data-service`, shared via context | Real APIs can take over; "arrays in components" was explicitly ruled out |
| Two bill collections (demo-store + service seed) that disagreed | One store (`services/mock/store.ts`) + one `listBills()` | Removes the class of bug where two caches drift |
| Bill payload assembled inline at save time | `domain/payload.ts` (single mapper, unit-tested) | Formatting rules became verifiable instead of buried in JSX-adjacent code |
| Validation rules spread through JSX props | `domain/validation.ts` (pure function over values) | Rules are testable without rendering |
| Repeated 6-field issuing/beneficiary markup ×2 | Documents tab renders party blocks from field lists | Same fields, one description |
| English strings and layout mixed with logic | UI kit primitives + `.section`/`.grid` classes | Markup is skim-readable |

---

## Mock services (API-ready)

Every function is `Promise`-based and passes through `simulateNetwork()` (140–380 ms,
`QUICK_LATENCY_MS` for lookups). Queries containing the token `//fail` reject with a
`ServiceError`, which is how the error and retry states were built and tested — e.g. type
`//fail` into the exporter search on the Details tab to see the retry affordance.

State handling is consistent by construction:

* **loading** — debounced "Searching" row in comboboxes, skeleton panels for page reads
* **success** — options, tables, saved bill
* **empty** — "No matching results found", "No marks configured for this exporter",
  "No shipping bills yet"
* **error** — message + retry in the combobox, the form, and the dashboard

Write endpoints (`createExporter`, `createBusiness`, `createBranch`, `saveBill`) return the
saved record, so the quick-add dialogs can select the new party immediately.

### Switching to a real backend

| Service call | Becomes |
| --- | --- |
| `listBills()` | `GET /api/shipping-bills` |
| `getBillById(id)` | `GET /api/shipping-bills/:id` |
| `saveBill(values, id)` | `POST /api/shipping-bills` or `PUT /api/shipping-bills/:id` |
| `downloadFlatFile(bill)` | `GET /api/shipping-bills/:id/flat-file` (blob) |
| `getReferenceData()` | `GET /api/reference-data` |
| `searchExporters(query)` … | `GET /api/exporters?q=` … |

---

## Domain handling and assumptions

Relationships implemented in `domain/validation.ts` (each marked `(assumption)` in code):

* Required header fields: job date, exporter + branch, consignee + branch, loading port,
  final destination port.
* Invoice: number, date, currency, contract type; at least one item.
* Item: RITC/HS code, description, unit, quantity and unit price above zero.
* **Buyer fields are required when "Buyer & consignee are same" is unchecked.**
* Net weight may not exceed gross weight.
* Third-party items must name a third party and branch.
* Packing ranges must be complete and ordered (`To ≥ From`).
* Container/document/licence rows must carry their key fields.

Also fixed while porting (behaviour preserved, correctness improved):

1. The item "Unit of rate" placeholder read `invoice.items[index]` instead of the current
   item, so it showed the wrong unit from the second item onward.
2. The displayed invoice total ignored the manual total override while the saved payload
   honoured it; the display now shows the effective (saved) total.
3. Form fields the starter collected but never sent (AR4 number/date, goods description
   line 2/3, accessory status) are now part of the payload mapper, so nothing is silently
   dropped on save.
4. A new business must play at least one role, otherwise it can never be found again.

Kept deliberately, to avoid "fixing" the contract: the `packging_list` payload key
(existing API field name), epoch-day document dates, and `IGST taxable/amount` only when
the item's IGST status is `P`.

---

## Testing

```
npm test    →  57 tests, 0 failures
```

* **Domain (43)** — totals, port→country, epoch dates, every validation rule, payload
  mapping, flat-file frames/CRLF/sanitisation.
* **Form state (8)** — immutability of `setPath`, row add/remove, error lookup.
* **Services (14)** — search filters, role filtering, create/update round-trips, cached
  reference data, exporter-scoped marks, failure injection, save-then-list behaviour.

Everything runs on `node --test`, so no test framework was added. Rendered output was
smoke-checked by server-rendering the whole form (all three tabs mount, ~48 kB of markup);
the interactive paths are what the browser run is for.

---

## AI Usage & Approach

* **Tools:** an AI coding agent (Arena) for scaffolding, the mechanical parts of the port
  (moving ~4.5k lines of starter code into the new structure) and drafting tests; VS Code
  and `npm run dev` for review; the assistant's own `npm test` / `tsc` / `vite build` runs
  as a gate on every change.
* **How:** I first read the starter and the assignment end to end, wrote down the exact
  field list, conditional rules and copy to preserve, and only then let the agent move code.
  The architecture (domain / services / state / ui / features) was my decision; the agent
  implemented it section by section.
* **Extras that helped:** the SSR smoke render to catch runtime errors before clicking
  through the app; the `//fail` token to exercise error states on purpose; unit tests
  written *after* the code but *read* line by line against the starter.
* **Judgment:** refused new dependencies (the private submodule's React Hook Form, Zustand,
  React Query and Tailwind were replaced with ~250 lines of in-repo equivalents rather than
  added to `package.json`), kept the two known payload quirks instead of "improving" the
  API contract, and skipped anything the brief called out of scope (design system, customs
  completeness, infra).
* **Validation:** typecheck + build clean, 57 tests pass, every conditional field was
  diffed against the starter, and the flat-file output was compared with the starter's
  generator for the same bill.

---

## Deliberately not done

No real backend, no third-party integrations, no exhaustive customs rule set, no design
system, no CI. The brief asks for a focused refactor of the existing form, clean service
integration and maintainable code — that is the scope of this repository.
