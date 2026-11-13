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

So far: `packages/shared`, the shell, and stand-in library pages. The real
library versions land step by step.

## Develop

Requires Node 22 and pnpm 10.

```sh
pnpm install
pnpm dev          # shell on http://localhost:5173, library pages proxied from :5174
pnpm lint
pnpm typecheck
pnpm test
pnpm build        # shell and all library pages into dist/
pnpm e2e          # Playwright against the built site
```

The shell keeps its state in the URL, e.g.
`/?lib=mui&tab=rivals&view=both&device=pixel-10`. The phone picker lists five
iPhones and five Android phones; sizes are in `apps/shell/src/devices.ts`.
