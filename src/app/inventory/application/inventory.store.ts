import { inject, Injectable, signal } from '@angular/core';

import { Product } from '../domain/model/product.entity';
import { Category } from '../domain/model/category.entity';

import { ProductApi } from '../infrastructure/product-api';
import { CategoryApi } from '../infrastructure/category-api';
import { Lot } from '../domain/model/lot.entity';
import { LotApi } from '../infrastructure/lot-api';
import { InventoryMovement } from '../domain/model/inventory-movement.entity';
import { InventoryMovementApi } from '../infrastructure/inventory-movement-api';
import { Alert } from '../domain/model/alert.entity';
import { AlertApi } from '../infrastructure/alert-api';
import { forkJoin, of } from 'rxjs';
import { PhysicalCount } from '../domain/model/physical-count.entity';
import { PhysicalCountApi } from '../infrastructure/physical-count-api';

@Injectable({
  providedIn: 'root',
})
export class InventoryStore {
  private readonly physicalCountApi = inject(PhysicalCountApi);
  private readonly physicalCountsSignal = signal<PhysicalCount[]>([]);
  private readonly physicalCountsLoadingSignal = signal(false);
  private readonly physicalCountsErrorSignal = signal<string | null>(null);
  private readonly physicalCountsSavingSignal = signal(false);
  readonly physicalCounts = this.physicalCountsSignal.asReadonly();
  readonly physicalCountsLoading = this.physicalCountsLoadingSignal.asReadonly();
  readonly physicalCountsError = this.physicalCountsErrorSignal.asReadonly();
  readonly physicalCountsSaving = this.physicalCountsSavingSignal.asReadonly();

  loadPhysicalCounts(): void {
    this.physicalCountsLoadingSignal.set(true);
    this.physicalCountsErrorSignal.set(null);
    forkJoin({ counts: this.physicalCountApi.getAll(), lots: this.lotApi.getAll(), products: this.productApi.getAll() }).subscribe({
      next: ({ counts, lots, products }) => {
        this.physicalCountsSignal.set(counts);
        this.lotsSignal.set(lots);
        this.productsSignal.set(products);
        this.physicalCountsLoadingSignal.set(false);
      },
      error: () => {
        this.physicalCountsErrorSignal.set('physicalCounts.errors.load');
        this.physicalCountsLoadingSignal.set(false);
      },
    });
  }

  createPhysicalCount(count: PhysicalCount, onSuccess?: () => void, onError?: () => void): void {
    if (this.physicalCountsSaving()) return;
    this.physicalCountsSavingSignal.set(true);
    this.physicalCountApi.create(count).subscribe({
      next: (created) => {
        this.physicalCountsSignal.update((counts) => [created, ...counts]);
        this.physicalCountsSavingSignal.set(false);
        onSuccess?.();
      },
      error: () => {
        this.physicalCountsSavingSignal.set(false);
        onError?.();
      },
    });
  }

  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly lotApi = inject(LotApi);
  private readonly movementApi = inject(InventoryMovementApi);
  private readonly alertApi = inject(AlertApi);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly lotsSignal = signal<Lot[]>([]);
  private readonly lotsLoadingSignal = signal(false);
  private readonly lotsErrorSignal = signal<string | null>(null);
  private readonly movementsSignal = signal<InventoryMovement[]>([]);
  private readonly movementsLoadingSignal = signal(false);
  private readonly movementsErrorSignal = signal<string | null>(null);
  private readonly alertsSignal = signal<Alert[]>([]);
  private readonly alertsLoadingSignal = signal(false);
  private readonly alertsErrorSignal = signal<string | null>(null);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly lots = this.lotsSignal.asReadonly();
  readonly lotsLoading = this.lotsLoadingSignal.asReadonly();
  readonly lotsError = this.lotsErrorSignal.asReadonly();
  readonly movements = this.movementsSignal.asReadonly();
  readonly movementsLoading = this.movementsLoadingSignal.asReadonly();
  readonly movementsError = this.movementsErrorSignal.asReadonly();
  readonly alerts = this.alertsSignal.asReadonly();
  readonly alertsLoading = this.alertsLoadingSignal.asReadonly();
  readonly alertsError = this.alertsErrorSignal.asReadonly();

  loadAlerts(): void {
    this.alertsLoadingSignal.set(true);
    this.alertsErrorSignal.set(null);
    forkJoin({ alerts: this.alertApi.getAll(), products: this.productApi.getAll(), lots: this.lotApi.getAll() }).subscribe({
      next: ({ alerts, products, lots }) => {
        this.productsSignal.set(products);
        this.lotsSignal.set(lots);
        const existingKeys = new Set(alerts.map((alert) => this.alertKey(alert.type, alert.productId, alert.lotId)));
        const today = new Date().toISOString().slice(0, 10);
        const generatedAt = new Date().toISOString();
        const candidates: Alert[] = [];
        for (const product of products.filter((item) => item.active)) {
          const productLots = lots.filter((lot) => lot.active && lot.productId === product.id);
          const stock = productLots.reduce((total, lot) => total + lot.quantity, 0);
          if (stock <= product.minimumStock) {
            const key = this.alertKey('LOW_STOCK', product.id, null);
            if (!existingKeys.has(key)) {
              candidates.push(new Alert(0, product.id, null, 'LOW_STOCK', 'WARNING', `Available stock (${stock}) is at or below the minimum (${product.minimumStock}).`, generatedAt, false));
              existingKeys.add(key);
            }
          }
        }
        for (const lot of lots.filter((item) => item.active && item.expirationDate && item.expirationDate < today)) {
          const key = this.alertKey('EXPIRED', lot.productId, lot.id);
          if (!existingKeys.has(key)) {
            candidates.push(new Alert(0, lot.productId, lot.id, 'EXPIRED', 'CRITICAL', `Lot ${lot.batchNumber} expired on ${lot.expirationDate}.`, generatedAt, false));
            existingKeys.add(key);
          }
        }
        (candidates.length ? forkJoin(candidates.map((alert) => this.alertApi.create(alert))) : of([])).subscribe({
          next: (created) => {
            this.alertsSignal.set([...alerts, ...created].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt) || b.id - a.id));
            this.alertsLoadingSignal.set(false);
          },
          error: () => {
            this.alertsSignal.set(alerts);
            this.alertsErrorSignal.set('inventoryErrors.generateAlerts');
            this.alertsLoadingSignal.set(false);
          },
        });
      },
      error: () => {
        this.alertsErrorSignal.set('inventoryErrors.loadAlerts');
        this.alertsLoadingSignal.set(false);
      },
    });
  }

  attendAlert(alert: Alert): void {
    this.alertApi.update(new Alert(alert.id, alert.productId, alert.lotId, alert.type, alert.level, alert.message, alert.generatedAt, true)).subscribe({
      next: (updated) => this.alertsSignal.update((alerts) => alerts.map((item) => item.id === updated.id ? updated : item)),
      error: () => this.alertsErrorSignal.set('inventoryErrors.updateAlert'),
    });
  }

  private alertKey(type: string, productId: number | null, lotId: number | null): string {
    return `${type}:${productId ?? ''}:${lotId ?? ''}`;
  }

  loadMovements(): void {
    this.movementsLoadingSignal.set(true);
    this.movementsErrorSignal.set(null);
    this.movementApi.getAll().subscribe({
      next: (movements) => {
        this.movementsSignal.set(movements);
        this.movementsLoadingSignal.set(false);
      },
      error: () => {
        this.movementsLoadingSignal.set(false);
        this.movementsErrorSignal.set('inventoryErrors.loadMovements');
      },
    });
  }

  createMovement(movement: InventoryMovement): void {
    this.movementsErrorSignal.set(null);
    this.movementApi.create(movement).subscribe({
      next: (createdMovement) =>
        this.movementsSignal.update((movements) => [createdMovement, ...movements]),
      error: () => this.movementsErrorSignal.set('inventoryErrors.createMovement'),
    });
  }

  loadLots(): void {
    this.lotsLoadingSignal.set(true);
    this.lotsErrorSignal.set(null);
    this.lotApi.getAll().subscribe({
      next: (lots) => {
        this.lotsSignal.set(lots);
        this.lotsLoadingSignal.set(false);
      },
      error: () => {
        this.lotsLoadingSignal.set(false);
        this.lotsErrorSignal.set('inventoryErrors.loadLots');
      },
    });
  }

  createLot(lot: Lot): void {
    this.lotsErrorSignal.set(null);
    this.lotApi.create(lot).subscribe({
      next: (createdLot) => this.lotsSignal.update((lots) => [...lots, createdLot]),
      error: () => this.lotsErrorSignal.set('inventoryErrors.createLot'),
    });
  }

  updateLot(lot: Lot): void {
    this.lotsErrorSignal.set(null);
    this.lotApi.update(lot).subscribe({
      next: (updatedLot) =>
        this.lotsSignal.update((lots) =>
          lots.map((currentLot) => (currentLot.id === updatedLot.id ? updatedLot : currentLot)),
        ),
      error: () => this.lotsErrorSignal.set('inventoryErrors.updateLot'),
    });
  }

  deleteLot(id: number): void {
    this.lotsErrorSignal.set(null);
    this.lotApi.delete(id).subscribe({
      next: () => this.lotsSignal.update((lots) => lots.filter((lot) => lot.id !== id)),
      error: () => this.lotsErrorSignal.set('inventoryErrors.deleteLot'),
    });
  }

  loadProducts(): void {
    this.productApi.getAll().subscribe({
      next: (products) => {
        this.productsSignal.set(products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  loadCategories(): void {
    this.categoryApi.getAll().subscribe({
      next: (categories) => {
        this.categoriesSignal.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  createProduct(product: Product): void {
    this.productApi.create(product).subscribe({
      next: (createdProduct) => {
        this.productsSignal.update((products) => [...products, createdProduct]);
      },
      error: (error) => {
        console.error('Error creating product:', error);
      },
    });
  }
  updateProduct(product: Product): void {
    this.productApi.update(product).subscribe({
      next: (updatedProduct) => {
        this.productsSignal.update((products) =>
          products.map((currentProduct) =>
            currentProduct.id === updatedProduct.id ? updatedProduct : currentProduct,
          ),
        );
      },
      error: (error) => {
        console.error('Error updating product:', error);
      },
    });
  }
  deleteProduct(id: number): void {
    this.productApi.delete(id).subscribe({
      next: () => {
        this.productsSignal.update((products) => products.filter((product) => product.id !== id));
      },
      error: (error) => {
        console.error('Error deleting product:', error);
      },
    });
  }
}
