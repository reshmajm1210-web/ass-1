## Export Software Frontend

Built on top of [fe-zen-arch](https://github.com/shivamkj/fe-zen-arch) — the core shared architecture for B2B SaaS frontends.

### Libraries

- **React** [Docs](https://react.dev/reference/react)
- **Tailwind CSS** [Docs](https://tailwindcss.com/docs/installation)
- **React Query** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand** [Docs](https://zustand.docs.pmnd.rs/)

### Setup

```bash
pnpm install   # fe-zen-arch is included as a git submodule, init it first if missing
pnpm dev       # dev server on port 5173
pnpm lint      # prettier + tsc + eslint (fe-zen-arch lint pipeline)
pnpm build     # production build
```

### Architecture

- `src/shared/routes.tsx` + `src/shared/route-paths.ts` define the zustand router routes.
- `src/shipping-bills/model.ts` holds domain types, empty factories, payload mapping and small helpers. No UI or data fetching lives here.
- `src/shipping-bills/demo-store.ts` is the in-memory/localStorage demo data store (exporters, businesses, saved bills). It is the single source of mock persistence.
- `src/shipping-bills/party-mock-service.ts` exposes async, Promise-based services for searching parties/branches/ports. UI components depend on this service, not on the raw arrays.
- `src/shipping-bills/reference-data-service.ts` exposes async access to all reference/option data (ports, cargo, schemes, quantity codes, document codes, trade agreements, states, ...). UI components load options through `use-form-options.ts` instead of importing hardcoded arrays.
- `src/shipping-bills/shipping-bill-service.ts` is the API boundary for Shipping Bills: `list`, `getById`, `upsert`, `downloadFlatFile`. It is fully mock (in-memory + simulated latency) so a real HTTP API can replace it with minimal UI changes. It never touches the DOM beyond the local flat-file download fallback.
- `src/shipping-bills/shipping-bill-form.tsx` contains the form UI and react-hook-form wiring. Section components (`InvoiceEditor`, `DocumentItem`, `PartyFields`, `AsyncPartySelect`) keep the rendering focused.

### Domain assumptions

- A shipping bill belongs to one exporter branch and one consignee branch.
- Loading port is an Indian port (`IN*`); destination port is any supported port. Country codes are derived from port codes.
- Buyer defaults to the consignee when `buyerSameAsConsignee` is true.
- Item quantity and unit price must be positive; invoice/cargo totals are derived, not trusted from input.
- Scheme codes drive drawback/RODTEP/ROSCTL sections; only schemes flagged accordingly reveal those fields.
- Mock data is seeded; a real backend would replace the services without changing the form.

### Notes

- `core`, `ui`, `auth`, `icons` are fe-zen-arch workspace packages, aliased via tsconfig paths & vite aliases.
- Forms are built directly with `useForm` from `core/form` + `Form` from `core/form/components` — no generic form templates.
- Routing uses fe-zen-arch's zustand router.
- Auth uses the fe-zen-arch auth module out of the box.
- API base URL comes from `PUBLIC_API_URL` (`.env`).
- Don't use react-query mutation for react-hook-form submit handler.
- For HMR, the file must export only react component, and not any other constant or object.
- While most input elements use `...register('name')`, custom elements like select require `<Select<T> name="name" />` instead.

### AI Usage & Approach

- Tools used: AI coding assistant for scaffolding refactors, service extraction, and documentation.
- How used: generated initial service/hook skeletons and README text, then manually reviewed, type-checked (`tsc --noEmit`), and build-verified (`pnpm build`).
- Judgment: kept the existing fe-zen-arch form stack and data model intact; avoided new dependencies; moved hardcoded arrays behind async services; preserved all existing form functionality.
- Learnings/validation: verified TypeScript compilation and production build after each change; ensured no direct hardcoded array imports remain in UI components.
