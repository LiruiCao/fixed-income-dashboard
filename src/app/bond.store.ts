import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface Bond {
  id: string;
  name: string;
  cusip: string;
  price: number;
  yield: number;
  change: number;
  direction: 'up' | 'down' | 'flat';
}

export interface BondState {
  bonds: Bond[];
  isConnected: boolean;
  lastUpdated: string | null;
}

const initialState: BondState = {
  bonds: [],
  isConnected: false,
  lastUpdated: null,
};

export const BondStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setBonds(bonds: Bond[]): void {
      patchState(store, {
        bonds,
        lastUpdated: new Date().toISOString(),
      });
    },
    updateBond(updatedBond: Bond): void {
      patchState(store, (state) => ({
        bonds: state.bonds.map((b) =>
          b.id === updatedBond.id ? { ...updatedBond } : b
        ),
        lastUpdated: new Date().toISOString(),
      }));
    },
    setConnected(isConnected: boolean): void {
      patchState(store, { isConnected });
    },
  }))
);
