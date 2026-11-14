# Kingpin OS

One satirical back-office dashboard, built six times in six React UI libraries
(shadcn/ui, MUI, Mantine, Chakra UI, DaisyUI, HeroUI), so you can compare look,
feel, mobile behavior and cost side by side.

Everything in the demo is invented: names, places, products and numbers.

## Layout

```
apps/shell          header, library switcher, viewport toggle, stats badges (plain CSS)
apps/showcase       one page per library, each loaded in its own iframe
packages/shared     seed data, types, state hooks, validation, component contract
packages/page       the Kingpin OS page, written once against the contract
packages/ui-*       one package per library implementing the contract
scripts/measure     gzipped bundle size, lines of code, hand-built count -> stats.json
```

All six libraries are in: `packages/ui-shadcn`, `ui-mui`, `ui-mantine`,
`ui-chakra`, `ui-heroui` and `ui-daisyui`.

## Adding a library

1. Create `packages/ui-<id>` exporting a `Kit` (all 12 contract components
   from `@kingpin/shared`) and a `manifest` marking each as `library` or
   `hand-built`.
2. Point `apps/showcase/src/entries/<id>.tsx` at `KingpinPage` with that kit
   and the library's styles.
3. Add the id to `LIBS` in `e2e/page.spec.ts`; the shared behavior tests then
   run against it at desktop and phone sizes.

## Mobile and performance checks

`pnpm e2e` checks the mobile rules for every library on a phone viewport:
the nav becomes a drawer, the table becomes cards, the form is one column,
the modal is full width, and touch targets are at least 44px.
`e2e/screenshots.spec.ts` also saves each page at 390px and 1280px (plus
the open drawer and modal on the phone) to `screenshots/`. CI uploads those
as the `screenshots` artifact.

To run Lighthouse on the shell against the production build:

```sh
pnpm build && pnpm preview
npx lighthouse http://localhost:4173/ --view
```

## Deploy

The site is static and runs on Cloudflare Workers static assets
(`wrangler.jsonc`), with no Worker script. The `Deploy` GitHub workflow:

- deploys `main` to production on every push, and
- uploads a preview for every pull request from this repo, at
  `pr-<number>-kingpin-os.<your-subdomain>.workers.dev`. The URL is in the
  job summary.

It needs two repository secrets, set under Settings → Secrets and variables
→ Actions:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token made from the "Edit
  Cloudflare Workers" template.
- `CLOUDFLARE_ACCOUNT_ID`: shown on the Cloudflare dashboard's Workers
  overview.

Until they are set, the workflow skips the deploy and says so. To deploy by
hand, run `pnpm wrangler login` and then `pnpm deploy`. To serve the built
site the way Cloudflare will, run `pnpm build && pnpm wrangler dev`.

## Develop

Requires Node 22 and pnpm 10.

```sh
pnpm install
pnpm dev          # shell on http://localhost:5173, library pages proxied from :5174
pnpm lint
pnpm typecheck
pnpm test
pnpm build        # shell and all library pages into dist/, then dist/stats.json
pnpm e2e          # Playwright against the built site
```

The shell keeps its state in the URL, e.g.
`/?lib=mui&tab=rivals&view=both&device=pixel-10`. The phone picker lists five
iPhones and five Android phones; sizes are in `apps/shell/src/devices.ts`.

## Stats badges

`pnpm build` ends with `scripts/measure`, which writes `dist/stats.json` for
every library that has a `packages/ui-<id>` kit:

- **JS / CSS**: gzipped size of every file the library's page loads up front
  (React and the shared page code included, so totals compare what a visitor
  downloads). Read from Vite's build manifest.
- **Lines of code**: non-blank, non-comment lines of TS, TSX and CSS in the
  kit package. For shadcn/ui this includes the copied component sources.
- **From library / hand-built**: counted from the kit's `manifest.ts`.

The shell reads the file at runtime; libraries without a kit show a note
instead of numbers.
