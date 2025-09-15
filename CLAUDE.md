# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Tasks
- **Development server**: `yarn dev` or `yarn start` - Runs Vite dev server on port 3000
- **Build**: `yarn build` - Builds for production (runs Vite build + TypeScript compilation)
- **Preview**: `yarn serve` - Preview production build locally
- **Test**: `yarn test` - Run Vitest tests
- **Lint & Format**: `yarn lint`, `yarn format`, `yarn check` - Biome linting and formatting

### Testing
- Uses **Vitest** with jsdom environment
- Test files should follow `*.test.ts` or `*.spec.ts` pattern
- Testing library is configured for React components

## Architecture & Framework

### Core Stack
- **React 19** with TypeScript
- **TanStack Router** for file-based routing with auto-generation
- **Vite** as build tool with React plugin
- **Tailwind CSS v4** for styling
- **Biome** for linting and formatting (replaces ESLint/Prettier)

### Project Structure
```
src/
├── components/          # Reusable React components
├── routes/             # File-based routes (TanStack Router)
│   ├── __root.tsx      # Root layout with Header and dev tools
│   └── index.tsx       # Home page route
├── main.tsx            # App entry point with router setup
├── styles.css          # Global styles
└── reportWebVitals.ts  # Performance monitoring
```

### Router Architecture
- **File-based routing**: Routes defined as files in `src/routes/`
- **Route generation**: TanStack Router auto-generates `routeTree.gen.ts` (should not be edited)
- **Root layout**: `__root.tsx` contains Header component and dev tools
- **Route definition**: Each route exports a `Route` created with `createFileRoute()`
- **Navigation**: Use `Link` component from `@tanstack/react-router` for SPA navigation

### Key Configuration
- **Path alias**: `@/*` maps to `./src/*` (configured in both vite.config.ts and tsconfig.json)
- **Auto code splitting**: Enabled in TanStack Router plugin
- **Strict TypeScript**: Enabled with unused parameter/variable detection
- **Biome formatting**: Uses tabs, double quotes, and organize imports

### Router Features Available
- **Loaders**: Route-level data fetching before render
- **Context**: Global router context for sharing state
- **Preloading**: Intent-based preloading enabled
- **Scroll restoration**: Automatic scroll position restoration
- **Dev tools**: TanStack Router devtools in development

### Development Notes
- Router automatically generates type-safe route definitions
- Demo files are prefixed with `demo` and can be safely removed
- Dev tools panel positioned at bottom-left
- Biome ignores generated `routeTree.gen.ts` file