# Gbox360 — Investor Perception Index Platform

This project was created with ScopesFlow automation.

## 404 Not Found Page

The 404 page (`/404`) provides an enterprise-grade error experience with integrated Search & Filter discovery. When users land on a non-existent route, they see:

- **ErrorHero** — Friendly "We can't find that page" message with serif typography
- **ActionBar** — Go to Dashboard (primary) and Go to Landing Page (secondary)
- **TypeaheadSearchModule** — Company search with debounced API calls and null-safe rendering
- **FilterPanel** — Date range, event type, and timeline preset filters for NarrativeEvents/IPI
- **ResultsPreviewCard** — Quick access to companies; shows top 5 when data is available
- **FloatingPromotionalCard** — Brown gradient CTA linking to About & Help

### Extending the 404 Page

To add discovery components:

1. **Search**: The `TypeaheadSearchModule` uses `useCompanySearch` and `companiesApi.search`. Add a `limit` param or new filters in `src/api/companies.ts`.
2. **Filters**: Extend `FilterPanel`'s `FilterState` and wire `onFiltersChange` to fetch timeline data via `ipiApi.getTimelines(companyId, { from, to, types })`.
3. **Results**: Pass filtered data to `ResultsPreviewCard` when a company is selected and filters are applied. Use `ipiApi.getEvents` or `getTimelines` for NarrativeEvent lists.
4. **API fallbacks**: All components guard against null/undefined. Use `(data ?? []).map(...)` and `Array.isArray(response?.data) ? response.data : []` for safe rendering.
