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

So far: `packages/shared`, `packages/page`, the shell, and the shadcn/ui
version (`packages/ui-shadcn`). The other five libraries show stand-in pages
until their kits land.

## Adding a library

1. Create `packages/ui-<id>` exporting a `Kit` (all 12 contract components
   from `@kingpin/shared`) and a `manifest` marking each as `library` or
   `hand-built`.
2. Point `apps/showcase/src/entries/<id>.tsx` at `KingpinPage` with that kit
   and the library's styles.
3. Add the id to `LIBS` in `e2e/page.spec.ts`; the shared behavior tests then
   run against it at desktop and phone sizes.

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
