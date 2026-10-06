import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';

import { Product } from '../domain/model/product.entity';
import { Category } from '../domain/model/category.entity';
import { Lot } from '../domain/model/lot.entity';
import { InventoryMovement } from '../domain/model/inventory-movement.entity';
import { PhysicalCount } from '../domain/model/physical-count.entity';
import { Alert } from '../domain/model/alert.entity';

import { ProductApi } from '../infrastructure/product-api';
import { CategoryApi } from '../infrastructure/category-api';
import { LotApi } from '../infrastructure/lot-api';
import { InventoryMovementApi } from '../infrastructure/inventory-movement-api';
import { PhysicalCountApi } from '../infrastructure/physical-count-api';
import { AlertApi } from '../infrastructure/alert-api';
import { User } from '../../iam/domain/model/user.entity';

@Injectable({
  providedIn: 'root',
})
export class InventoryStore {

  // =========================================================
  // APIs
  // =========================================================

  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly lotApi = inject(LotApi);
  private readonly movementApi = inject(InventoryMovementApi);
  private readonly physicalCountApi = inject(PhysicalCountApi);
  private readonly alertApi = inject(AlertApi);

  // =========================================================
  // PRODUCTS / CATEGORIES
  // =========================================================

  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();

  // =========================================================
  // LOTS
  // =========================================================

  private readonly lotsSignal = signal<Lot[]>([]);
  private readonly lotsLoadingSignal = signal(false);
  private readonly lotsErrorSignal = signal<string | null>(null);

  readonly lots = this.lotsSignal.asReadonly();
  readonly lotsLoading = this.lotsLoadingSignal.asReadonly();
  readonly lotsError = this.lotsErrorSignal.asReadonly();

  // =========================================================
  // MOVEMENTS
  // =========================================================

  private readonly movementsSignal = signal<InventoryMovement[]>([]);
  private readonly movementsLoadingSignal = signal(false);
  private readonly movementsErrorSignal = signal<string | null>(null);

  readonly movements = this.movementsSignal.asReadonly();
  readonly movementsLoading = this.movementsLoadingSignal.asReadonly();
  readonly movementsError = this.movementsErrorSignal.asReadonly();

  // =========================================================
  // PHYSICAL COUNTS
  // =========================================================

  private readonly physicalCountsSignal = signal<PhysicalCount[]>([]);
  private readonly physicalCountsLoadingSignal = signal(false);
  private readonly physicalCountsErrorSignal = signal<string | null>(null);

  readonly physicalCounts = this.physicalCountsSignal.asReadonly();
  readonly physicalCountsLoading =
    this.physicalCountsLoadingSignal.asReadonly();
  readonly physicalCountsError =
    this.physicalCountsErrorSignal.asReadonly();

  // =========================================================
  // ALERTS
  // =========================================================

  private readonly alertsSignal = signal<Alert[]>([]);
  private readonly alertsLoadingSignal = signal(false);
  private readonly alertsErrorSignal = signal<string | null>(null);
  private readonly usersSignal = signal<User[]>([]);

  readonly alerts = this.alertsSignal.asReadonly();
  readonly alertsLoading = this.alertsLoadingSignal.asReadonly();
  readonly alertsError = this.alertsErrorSignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();

  loadUsers(): void {
    this.physicalCountApi.getUsers().subscribe({
      next: (users) => this.usersSignal.set(users),
      error: () => this.usersSignal.set([]),
    });
  }

  // =========================================================
  // PHYSICAL COUNTS
  // =========================================================

  loadPhysicalCounts(): void {
    this.physicalCountsLoadingSignal.set(true);
    this.physicalCountsErrorSignal.set(null);

    this.physicalCountApi.getAll().subscribe({
      next: (counts) => {
        this.physicalCountsSignal.set(counts);
        this.physicalCountsLoadingSignal.set(false);
      },

      error: () => {
        this.physicalCountsLoadingSignal.set(false);
        this.physicalCountsErrorSignal.set(
          'Could not load physical counts. Please try again.',
        );
      },
    });
  }

  createPhysicalCount(count: PhysicalCount): void {
    this.physicalCountsErrorSignal.set(null);

    this.physicalCountApi.create(count).subscribe({
      next: (createdCount) =>
        this.physicalCountsSignal.update((counts) => [
          createdCount,
          ...counts,
        ]),

      error: () =>
        this.physicalCountsErrorSignal.set(
          'Could not save the physical count. Please try again.',
        ),
    });
  }

  // =========================================================
  // ALERTS
  // =========================================================

  loadAlerts(): void {
    this.alertsLoadingSignal.set(true);
    this.alertsErrorSignal.set(null);

    forkJoin({
      alerts: this.alertApi.getAll(),
      products: this.productApi.getAll(),
      lots: this.lotApi.getAll(),
    }).subscribe({
      next: ({ alerts, products, lots }) => {
        this.productsSignal.set(products);
        this.lotsSignal.set(lots);

        const existingKeys = new Set(
          alerts.map((alert) =>
            this.alertKey(
              alert.type,
              alert.productId,
              alert.lotId,
            ),
          ),
        );

        const today = new Date()
          .toISOString()
          .slice(0, 10);

        const generatedAt = new Date().toISOString();

        const candidates: Alert[] = [];

        // -----------------------------------------------------
        // LOW STOCK ALERTS
        // -----------------------------------------------------

        for (const product of products.filter(
          (item) => item.active,
        )) {
          const productLots = lots.filter(
            (lot) =>
              lot.active &&
              lot.productId === product.id,
          );

          const stock = productLots.reduce(
            (total, lot) => total + lot.quantity,
            0,
          );

          if (stock <= product.minimumStock) {
            const key = this.alertKey(
              'LOW_STOCK',
              product.id,
              null,
            );

            if (!existingKeys.has(key)) {
              candidates.push(
                new Alert(
                  0,
                  product.id,
                  null,
                  'LOW_STOCK',
                  'WARNING',
                  `Available stock (${stock}) is at or below the minimum (${product.minimumStock}).`,
                  generatedAt,
                  false,
                ),
              );

              existingKeys.add(key);
            }
          }
        }

        // -----------------------------------------------------
        // EXPIRED LOT ALERTS
        // -----------------------------------------------------

        for (const lot of lots.filter(
          (item) =>
            item.active &&
            item.expirationDate &&
            item.expirationDate < today,
        )) {
          const key = this.alertKey(
            'EXPIRED',
            lot.productId,
            lot.id,
          );

          if (!existingKeys.has(key)) {
            candidates.push(
              new Alert(
                0,
                lot.productId,
                lot.id,
                'EXPIRED',
                'CRITICAL',
                `Lot ${lot.batchNumber} expired on ${lot.expirationDate}.`,
                generatedAt,
                false,
              ),
            );

            existingKeys.add(key);
          }
        }

        // -----------------------------------------------------
        // CREATE GENERATED ALERTS
        // -----------------------------------------------------

        const createAlerts$ = candidates.length
          ? forkJoin(
              candidates.map((alert) =>
                this.alertApi.create(alert),
              ),
            )
          : of<Alert[]>([]);

        createAlerts$.subscribe({
          next: (created) => {
            this.alertsSignal.set(
              [...alerts, ...created].sort(
                (a, b) =>
                  b.generatedAt.localeCompare(
                    a.generatedAt,
                  ) ||
                  b.id - a.id,
              ),
            );

            this.alertsLoadingSignal.set(false);
          },

          error: () => {
            this.alertsSignal.set(alerts);

            this.alertsErrorSignal.set(
              'Could not generate inventory alerts. Please try again.',
            );

            this.alertsLoadingSignal.set(false);
          },
        });
      },

      error: () => {
        this.alertsErrorSignal.set(
          'Could not load alerts. Please try again.',
        );

        this.alertsLoadingSignal.set(false);
      },
    });
  }

  attendAlert(alert: Alert): void {
    const updatedAlert = new Alert(
      alert.id,
      alert.productId,
      alert.lotId,
      alert.type,
      alert.level,
      alert.message,
      alert.generatedAt,
      true,
    );

    this.alertApi.update(updatedAlert).subscribe({
      next: (updated) =>
        this.alertsSignal.update((alerts) =>
          alerts.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        ),

      error: () =>
        this.alertsErrorSignal.set(
          'Could not update the alert. Please try again.',
        ),
    });
  }

  private alertKey(
    type: string,
    productId: number | null,
    lotId: number | null,
  ): string {
    return `${type}:${productId ?? ''}:${lotId ?? ''}`;
  }

  // =========================================================
  // MOVEMENTS
  // =========================================================

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

        this.movementsErrorSignal.set(
          'Could not load movements. Please try again.',
        );
      },
    });
  }

  createMovement(
    movement: InventoryMovement,
  ): void {
    this.movementsErrorSignal.set(null);

    this.movementApi.create(movement).subscribe({
      next: (createdMovement) =>
        this.movementsSignal.update(
          (movements) => [
            createdMovement,
            ...movements,
          ],
        ),

      error: () =>
        this.movementsErrorSignal.set(
          'Could not create the movement. Please try again.',
        ),
    });
  }

  // =========================================================
  // LOTS
  // =========================================================

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

        this.lotsErrorSignal.set(
          'Could not load lots. Please try again.',
        );
      },
    });
  }

  createLot(lot: Lot): void {
    this.lotsErrorSignal.set(null);

    this.lotApi.create(lot).subscribe({
      next: (createdLot) =>
        this.lotsSignal.update((lots) => [
          ...lots,
          createdLot,
        ]),

      error: () =>
        this.lotsErrorSignal.set(
          'Could not create the lot. Please try again.',
        ),
    });
  }

  updateLot(lot: Lot): void {
    this.lotsErrorSignal.set(null);

    this.lotApi.update(lot).subscribe({
      next: (updatedLot) =>
        this.lotsSignal.update((lots) =>
          lots.map((currentLot) =>
            currentLot.id === updatedLot.id
              ? updatedLot
              : currentLot,
          ),
        ),

      error: () =>
        this.lotsErrorSignal.set(
          'Could not update the lot. Please try again.',
        ),
    });
  }

  deleteLot(id: number): void {
    this.lotsErrorSignal.set(null);

    this.lotApi.delete(id).subscribe({
      next: () =>
        this.lotsSignal.update((lots) =>
          lots.filter((lot) => lot.id !== id),
        ),

      error: () =>
        this.lotsErrorSignal.set(
          'Could not delete the lot. Please try again.',
        ),
    });
  }

  // =========================================================
  // PRODUCTS
  // =========================================================

  loadProducts(): void {
    this.productApi.getAll().subscribe({
      next: (products) => {
        this.productsSignal.set(products);
      },

      error: (error) => {
        console.error(
          'Error loading products:',
          error,
        );
      },
    });
  }

  createProduct(product: Product): void {
    this.productApi.create(product).subscribe({
      next: (createdProduct) => {
        this.productsSignal.update(
          (products) => [
            ...products,
            createdProduct,
          ],
        );
      },

      error: (error) => {
        console.error(
          'Error creating product:',
          error,
        );
      },
    });
  }

  updateProduct(product: Product): void {
    this.productApi.update(product).subscribe({
      next: (updatedProduct) => {
        this.productsSignal.update(
          (products) =>
            products.map((currentProduct) =>
              currentProduct.id ===
              updatedProduct.id
                ? updatedProduct
                : currentProduct,
            ),
        );
      },

      error: (error) => {
        console.error(
          'Error updating product:',
          error,
        );
      },
    });
  }

  deleteProduct(id: number): void {
    this.productApi.delete(id).subscribe({
      next: () => {
        this.productsSignal.update(
          (products) =>
            products.filter(
              (product) => product.id !== id,
            ),
        );
      },

      error: (error) => {
        console.error(
          'Error deleting product:',
          error,
        );
      },
    });
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  loadCategories(): void {
    this.categoryApi.getAll().subscribe({
      next: (categories) => {
        this.categoriesSignal.set(categories);
      },

      error: (error) => {
        console.error(
          'Error loading categories:',
          error,
        );
      },
    });
  }
}
