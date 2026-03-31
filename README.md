# Fixed Income Dashboard

Real-time bond price monitor built with Angular 17, NgRx Signal Store, ag-Grid, and WebSocket simulation.

**Tech Stack:** Angular 17 standalone | NgRx Signal Store | ag-Grid v31 | RxJS | TypeScript | Jest

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the app
npm start
# → http://localhost:4200

# 3. Run tests
npm test
```

---

## Architecture

```
src/app/
├── app.config.ts              # Standalone app config + routing
├── app.component.ts           # Root component (router outlet)
├── bond.store.ts              # NgRx Signal Store — bond state
├── bond.store.spec.ts         # Jest tests for store
├── websocket.service.ts       # Simulated WebSocket price feed
├── websocket.service.spec.ts  # Jest tests for WS service
└── dashboard/
    ├── dashboard.component.ts    # Main view — wires store + grid
    ├── dashboard.component.html  # Template
    └── dashboard.component.scss  # Dark theme styles
```

## Key Design Decisions

- **NgRx Signal Store** manages all bond state — single source of truth, zero manual change detection.
- **WebSocket simulation** runs via `interval(1500ms)` — mimics real market tick rates; swapping in a real `WebSocket` endpoint requires changing only `websocket.service.ts`.
- **ag-Grid `enableCellChangeFlash`** highlights updated cells on each price tick, matching front-office UX expectations.
- **Standalone components** throughout — no NgModule, aligned with Angular 17+ best practices.
