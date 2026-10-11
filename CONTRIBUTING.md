# Contributing

Contributions welcome. Be kind.

## Quick start

1. Fork & clone the repo.
2. `cd api/ && bun install` for the API server.
3. `cd web/ && bun install` for the docs website.
4. Make your changes.
5. Run tests: `cd api/ && bun test tests/live.test.ts`.
6. Lint web: `cd web/ && bun run lint`.
7. Open a PR.

## Code style

- TypeScript everywhere.
- Functions that wrap blitzyxsc features should be prefixed with `blitz`
  (e.g., `blitzClient()`, `blitzRateLimit`, `blitzCacheAside`).
- Match the existing style in each file.
- Update docs when you change the public API.

## Contact

- Issues: [github.com/blitzlabx/blitzyxsc-plus/issues](https://github.com/blitzlabx/blitzyxsc-plus/issues)
- X/Twitter: [@blitzlabx](https://x.com/blitzlabx)
- Donate: [flutterwave.com/donate/knjcdfjgzwyt](https://flutterwave.com/donate/knjcdfjgzwyt)

— Blitz
