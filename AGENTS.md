# AGENTS.md

## Build/Test Commands
- **Install**: `make install`
- **Build**: `make compile` (prod) or `make compile-dev` (dev)
- **Lint**: `make validate` (all), `make fix` (auto-fix JS/prettier)
- **JS tests**: `make test` or `yarn test -- path/to/file.spec.ts` (single file)
- **Scala tests**: `./sbt test` or `./sbt "project common" "testOnly *NavigationTest"` (single)

## Code Style
- **JS/TS**: ESLint + Prettier (`@guardian/prettier`), strict TypeScript
- **Scala**: Scalafmt (120 col, trailing commas), 2-space indent
- **Indentation**: 4 spaces default, tabs for `.ts`, 2 spaces for Scala/YAML

## Naming Conventions
- **JS/TS files**: kebab-case (`detect-breakpoint.ts`), tests: `*.spec.ts`
- **Scala files**: PascalCase matching class name, tests: `*Test.scala`
- **Functions/methods**: camelCase; **Types/Classes**: PascalCase

## Key Rules
- Do not name variables `guardian` (conflicts with `window.guardian`)
- Avoid `bonzo`, `qwery`, `bean` imports; use `lib/$$` instead
- JS source: `static/src/javascripts/`, base URL for imports
- Multi-module sbt/Play project: common, facia, article, applications, sport, etc.
