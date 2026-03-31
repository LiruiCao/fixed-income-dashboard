import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';
import { Bond } from './bond.store';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 6 initial bonds', () => {
    const bonds = service.getInitialBonds();
    expect(bonds.length).toBe(6);
  });

  it('should return bonds with required fields', () => {
    const bonds = service.getInitialBonds();
    bonds.forEach((bond: Bond) => {
      expect(bond.id).toBeDefined();
      expect(bond.name).toBeDefined();
      expect(bond.cusip).toBeDefined();
      expect(bond.price).toBeGreaterThan(0);
      expect(bond.yield).toBeGreaterThan(0);
      expect(['up', 'down', 'flat']).toContain(bond.direction);
    });
  });

  it('should emit price updates after connecting', fakeAsync(() => {
    const emitted: Bond[] = [];
    service.message$.subscribe((bond) => emitted.push(bond));

    service.connect();
    tick(3000); // advance timer by 3 seconds → 2 ticks at 1500ms

    expect(emitted.length).toBeGreaterThanOrEqual(1);
  }));

  it('should stop emitting after disconnect', fakeAsync(() => {
    const emitted: Bond[] = [];
    service.message$.subscribe((bond) => emitted.push(bond));

    service.connect();
    tick(1500);

    const countAfterFirstTick = emitted.length;
    service.disconnect();
    tick(3000); // no more ticks should fire

    expect(emitted.length).toBe(countAfterFirstTick);
  }));

  it('should not start duplicate subscriptions if connect called twice', fakeAsync(() => {
    const emitted: Bond[] = [];
    service.message$.subscribe((bond) => emitted.push(bond));

    service.connect();
    service.connect(); // second call should be ignored
    tick(1500);

    // Should only have one tick worth of updates (one bond updated)
    expect(emitted.length).toBe(1);
  }));
});
