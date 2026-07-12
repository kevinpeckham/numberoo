# Numberoo

Input a number and the website will return the name of that number in English — up to one googol (10^100).

## Stack

- [SvelteKit 2](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev) (runes)
- [UnoCSS](https://unocss.dev) (Tailwind-compatible `presetWind3`)
- [Vite 8](https://vite.dev) + [Bun](https://bun.sh)
- [Biome](https://biomejs.dev) for lint + format
- [Vitest 4](https://vitest.dev) — node project for unit tests, jsdom + [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) for component tests
- [fallow](https://docs.fallow.tools) for code-integrity checks

## Develop

```sh
bun install
bun run dev
```

## Test & checks

```sh
bun run test           # unit + component tests
bun run test:coverage  # with v8 coverage
bun run check          # svelte-check
bun run lint           # biome
bun run health         # fallow health report
```
