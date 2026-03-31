import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridModule } from "ag-grid-angular";
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClassParams,
  CellStyle,
  ModuleRegistry,
} from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import { Subscription } from "rxjs";

import { BondStore, Bond } from "../bond.store";
import { WebSocketService } from "../websocket.service";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private bondStore = inject(BondStore);
  private wsService = inject(WebSocketService);
  private wsSub: Subscription | null = null;
  private gridApi: GridApi | null = null;

  // Expose Signal Store state to template
  readonly bonds = this.bondStore.bonds;
  readonly isConnected = this.bondStore.isConnected;
  readonly lastUpdated = this.bondStore.lastUpdated;

  readonly bondCount = computed(() => this.bonds().length);

  // Track which rows flashed for CSS highlight
  flashedRowIds = signal<Set<string>>(new Set());

  columnDefs: ColDef<Bond>[] = [
    {
      field: "name",
      headerName: "Instrument",
      minWidth: 160,
      sortable: true,
      filter: true,
    },
    { field: "cusip", headerName: "CUSIP", minWidth: 140 },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      valueFormatter: (p) => p.value?.toFixed(3),
      cellStyle: (params: CellClassParams<Bond>): CellStyle => {
        if (!params.data) return {};
        if (params.data.direction === "up")
          return { color: "#16a34a", fontWeight: "600" };
        if (params.data.direction === "down")
          return { color: "#dc2626", fontWeight: "600" };
        return {};
      },
      enableCellChangeFlash: true,
    },
    {
      field: "yield",
      headerName: "Yield %",
      minWidth: 100,
      valueFormatter: (p) => p.value?.toFixed(4) + "%",
      enableCellChangeFlash: true,
    },
    {
      field: "change",
      headerName: "Change",
      minWidth: 100,
      valueFormatter: (p) =>
        p.value > 0 ? `+${p.value.toFixed(3)}` : p.value.toFixed(3),
      cellStyle: (params: CellClassParams<Bond>): CellStyle => {
        if (!params.data) return {};
        if (params.data.change > 0) return { color: "#16a34a" };
        if (params.data.change < 0) return { color: "#dc2626" };
        return {};
      },
    },
    {
      field: "direction",
      headerName: "▲▼",
      minWidth: 60,
      valueFormatter: (p) =>
        p.value === "up" ? "▲" : p.value === "down" ? "▼" : "—",
      cellStyle: (params: CellClassParams<Bond>): CellStyle => {
        if (params.value === "up") return { color: "#16a34a" };
        if (params.value === "down") return { color: "#dc2626" };
        return { color: "#6b7280" };
      },
    },
  ];

  defaultColDef: ColDef = {
    resizable: true,
    flex: 1,
  };

  ngOnInit(): void {
    // Load initial data into store
    this.bondStore.setBonds(this.wsService.getInitialBonds());

    // Subscribe to simulated WebSocket feed
    this.wsSub = this.wsService.message$.subscribe((updatedBond: Bond) => {
      this.bondStore.updateBond(updatedBond);

      // Flash the updated row in ag-Grid
      if (this.gridApi) {
        const rowNode = this.gridApi.getRowNode(updatedBond.id);
        if (rowNode) {
          rowNode.setData(updatedBond);
          this.gridApi.flashCells({ rowNodes: [rowNode] });
        }
      }
    });

    this.wsService.connect();
    this.bondStore.setConnected(true);
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  getRowId = (params: { data: Bond }) => params.data.id;

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.wsService.disconnect();
    this.bondStore.setConnected(false);
  }
}
