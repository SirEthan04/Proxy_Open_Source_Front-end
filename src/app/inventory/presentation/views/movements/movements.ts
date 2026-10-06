import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { InventoryStore } from '../../../application/inventory.store';
import { InventoryMovement } from '../../../domain/model/inventory-movement.entity';
import { MovementDialog, MovementDialogData } from '../../components/movement-dialog/movement-dialog';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-movements',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatPaginatorModule, DatePipe],
  templateUrl: './movements.html',
  styleUrl: './movements.css',
})
export class Movements implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly dialog = inject(MatDialog);
  private readonly iamStore = inject(IamStore);
  readonly movements = this.store.movements;
  readonly lots = this.store.lots;
  readonly products = this.store.products;
  readonly query = signal('');
  readonly typeFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const type = this.typeFilter();
    return this.movements().filter(movement => {
      const lot = this.lots().find(item => item.id === movement.lotId);
      const product = this.products().find(item => item.id === lot?.productId);
      const text = `${product?.name ?? ''} ${lot?.code ?? ''} ${movement.reason}`.toLocaleLowerCase();
      return (!type || movement.type === type) && (!query || text.includes(query));
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });
  readonly pageRows = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly entryCount = computed(() => this.movements().filter(movement => movement.type === 'ENTRY').length);
  readonly exitCount = computed(() => this.movements().filter(movement => movement.type === 'EXIT').length);
  ngOnInit(): void { this.store.loadMovements(); this.store.loadLots(); this.store.loadProducts(); }
  onSearch(value: string): void { this.query.set(value); this.pageIndex.set(0); }
  onType(value: string): void { this.typeFilter.set(value); this.pageIndex.set(0); }
  onPage(event: PageEvent): void { this.pageIndex.set(event.pageIndex); this.pageSize.set(event.pageSize); }
  openCreate(): void {
    const data: MovementDialogData = { lots: this.lots(), products: this.products() };
    this.dialog.open(MovementDialog, { data, width: '520px', maxWidth: '95vw' }).afterClosed().subscribe((movement: InventoryMovement | undefined) => {
      if (movement) this.store.createMovement(new InventoryMovement(movement.id, movement.lotId, this.currentUserId(), movement.type, movement.quantity, movement.date, movement.reason));
    });
  }
  lotLabel(lotId: number): string {
    const lot = this.lots().find(item => item.id === lotId);
    if (!lot) return `Lote ${lotId}`;
    const product = this.products().find(item => item.id === lot.productId);
    return `${product?.name ?? `Producto ${lot.productId}`} — ${lot.code || `Lote ${lot.id}`}`;
  }
  typeLabel(type: string): string { return ({ ENTRY: 'Entrada', EXIT: 'Salida', ADJUSTMENT: 'Ajuste' } as Record<string, string>)[type] ?? type; }
  private currentUserId(): number | null {
    return this.iamStore.currentUser()?.id ?? null;
  }
}
