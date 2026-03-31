import { Injectable, OnDestroy } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { Bond } from './bond.store';

// Simulates a WebSocket price feed for fixed income instruments.
// In production this would connect to a real WS endpoint:
//   this.socket = new WebSocket('wss://trading-platform/bonds/stream');
@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private messageSubject = new Subject<Bond>();
  public message$ = this.messageSubject.asObservable();

  private tickSubscription: Subscription | null = null;

  // Internal mutable state mirrors what a real WS feed would push
  private liveBonds: Bond[] = [
    {
      id: '1',
      name: 'US Treasury 2Y',
      cusip: 'US91282CJP88',
      price: 99.421,
      yield: 4.823,
      change: 0,
      direction: 'flat',
    },
    {
      id: '2',
      name: 'US Treasury 5Y',
      cusip: 'US91282CJN31',
      price: 97.185,
      yield: 4.612,
      change: 0,
      direction: 'flat',
    },
    {
      id: '3',
      name: 'US Treasury 10Y',
      cusip: 'US91282CJL74',
      price: 94.562,
      yield: 4.453,
      change: 0,
      direction: 'flat',
    },
    {
      id: '4',
      name: 'US Treasury 30Y',
      cusip: 'US912810TZ27',
      price: 89.124,
      yield: 4.621,
      change: 0,
      direction: 'flat',
    },
    {
      id: '5',
      name: 'Canada 2Y',
      cusip: 'CA135087ZY48',
      price: 98.754,
      yield: 3.912,
      change: 0,
      direction: 'flat',
    },
    {
      id: '6',
      name: 'Canada 10Y',
      cusip: 'CA135087ZX64',
      price: 93.218,
      yield: 3.744,
      change: 0,
      direction: 'flat',
    },
  ];

  getInitialBonds(): Bond[] {
    return this.liveBonds.map((b) => ({ ...b }));
  }

  connect(): void {
    if (this.tickSubscription) return;

    // Emit a price update every 1500ms — mimics WS tick rate
    this.tickSubscription = interval(1500).subscribe(() => {
      const idx = Math.floor(Math.random() * this.liveBonds.length);
      const bond = this.liveBonds[idx];

      const delta = parseFloat((Math.random() * 0.12 - 0.06).toFixed(3));
      const newPrice = parseFloat((bond.price + delta).toFixed(3));
      // Yield moves inversely to price (simplified)
      const newYield = parseFloat((bond.yield - delta * 0.04).toFixed(4));

      const updated: Bond = {
        ...bond,
        price: newPrice,
        yield: newYield,
        change: delta,
        direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      };

      this.liveBonds[idx] = updated;
      this.messageSubject.next(updated);
    });
  }

  disconnect(): void {
    this.tickSubscription?.unsubscribe();
    this.tickSubscription = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
