# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Azar App is a collection of chance-based games built with React + TypeScript + Vite. It includes a customizable roulette wheel, coin flip (Cara o Cruz), dice roller, Rock Paper Scissors (Piedra Papel Tijera), and Blackjack. The app features dark/light theme support, sound effects via Web Audio API, game statistics persistence, and is deployed to GitHub Pages.

## Development Commands

```bash
npm run dev      # Start Vite dev server (usually http://localhost:5173)
npm run build    # Type check with tsc and build for production
npm run preview  # Preview production build locally
```

## Architecture

### Component Structure

The app uses a tab-based architecture:

- **[App.tsx](src/App.tsx)**: Root component managing tab navigation and global theme state. Persists theme preference to localStorage and applies the `dark` class to `document.documentElement`.
- **Game Components**: Each game ([Ruleta](src/components/Ruleta.tsx), [CaraCruz](src/components/CaraCruz.tsx), [Dado](src/components/Dado.tsx), [PiedraPapelTijera](src/components/PiedraPapelTijera.tsx), [Blackjack](src/components/Blackjack.tsx)) is a self-contained module that:
  - Manages its own state (game logic, animations, results)
  - Persists data to localStorage (stats, history, custom configurations)
  - Uses the [playSound](src/utils/sounds.ts) utility for audio feedback
  - Implements keyboard shortcuts where applicable (Enter, Space)
- **[Modal.tsx](src/components/Modal.tsx)**: Reusable dialog component used across games for confirmations and information display.

### State Management

- **No global state library**: Each component manages its own state using React hooks
- **localStorage keys**: Each game uses a unique key (e.g., `blackjack_stats`, `ruleta_options`, `theme_mode`)
- **Persistence pattern**: Data is saved to localStorage on state changes and loaded in `useEffect` on mount

### Styling

- **Tailwind CSS**: All styling uses Tailwind utility classes
- **Dark mode**: Implemented via `dark:` class variants. Toggle button in navbar updates both state and `document.documentElement.classList`
- **Responsive design**: Mobile-first approach with responsive breakpoints (sm:, md:, etc.)
- **Dynamic colors**: Tab colors are defined in the `TABS` array in [App.tsx](src/App.tsx)

### Sound System

[sounds.ts](src/utils/sounds.ts) provides a unified sound API using Web Audio API:
- `playSound(type)` where type is: 'spin', 'win', 'lose', 'click', 'roll'
- Each sound is generated procedurally using oscillators and gain nodes
- No external audio files required

## Key Technical Details

### Vite Configuration

[vite.config.ts](vite.config.ts) sets `base: '/azar-app/'` for GitHub Pages deployment. This affects:
- Asset paths in production builds
- Routing if you add client-side routing in the future

### TypeScript

- Strict mode enabled
- Type definitions for game-specific interfaces in each component file
- No shared types file currently exists

### Game-Specific Notes

**Ruleta**: Customizable wheel with add/remove items functionality. Options persist to localStorage. Uses CSS transforms for rotation animation.

**Blackjack**: Implements full card deck logic with shuffle, deal, hit, stand, and dealer AI. Tracks detailed stats (wins/losses/ties/profit) and game history.

**CaraCruz**: Simple coin flip with 3D rotation animation using CSS transforms.

**Dado**: Dice roller with rotation animation. Displays numeric result.

**PiedraPapelTijera**: Rock Paper Scissors against simple AI opponent.

## Common Patterns When Adding Features

1. **Adding a new game**:
   - Create component in `src/components/`
   - Import and add to [App.tsx](src/App.tsx) TABS array
   - Add render condition in App's main content area
   - Follow existing game component patterns for consistency

2. **Modifying game logic**:
   - Game state is self-contained in each component
   - Update localStorage key and data structure if changing persistence
   - Ensure backward compatibility or add migration logic for localStorage

3. **Adding sounds**:
   - Add new sound type to [sounds.ts](src/utils/sounds.ts)
   - Implement sound generation function
   - Call `playSound(newType)` from component

## GitHub Pages Deployment

The project uses GitHub Actions workflow for automatic deployment. Build output is committed to `gh-pages` branch. Ensure `base` in vite.config.ts matches your repository name.
