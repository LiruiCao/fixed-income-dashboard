import { TestBed } from '@angular/core/testing';
import { BondStore, Bond } from './bond.store';

const mockBonds: Bond[] = [
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
    name: 'US Treasury 10Y',
    cusip: 'US91282CJL74',
    price: 94.562,
    yield: 4.453,
    change: 0,
    direction: 'flat',
  },
];

describe('BondStore', () => {
  let store: InstanceType<typeof BondStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(BondStore);
  });

  it('should initialize with empty bonds', () => {
    expect(store.bonds()).toEqual([]);
    expect(store.isConnected()).toBe(false);
    expect(store.lastUpdated()).toBeNull();
  });

  it('should set bonds via setBonds()', () => {
    store.setBonds(mockBonds);
    expect(store.bonds().length).toBe(2);
    expect(store.bonds()[0].name).toBe('US Treasury 2Y');
    expect(store.lastUpdated()).not.toBeNull();
  });

  it('should update a single bond via updateBond()', () => {
    store.setBonds(mockBonds);

    const updated: Bond = { ...mockBonds[0], price: 99.999, direction: 'up', change: 0.578 };
    store.updateBond(updated);

    const result = store.bonds().find((b) => b.id === '1');
    expect(result?.price).toBe(99.999);
    expect(result?.direction).toBe('up');
  });

  it('should not mutate other bonds when updating one', () => {
    store.setBonds(mockBonds);
    const original = store.bonds()[1].price;

    const updated: Bond = { ...mockBonds[0], price: 100.0 };
    store.updateBond(updated);

    expect(store.bonds()[1].price).toBe(original);
  });

  it('should set connection status', () => {
    store.setConnected(true);
    expect(store.isConnected()).toBe(true);

    store.setConnected(false);
    expect(store.isConnected()).toBe(false);
  });
});
