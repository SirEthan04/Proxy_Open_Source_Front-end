import { inject, Injectable, signal } from '@angular/core';

import { Product } from '../domain/model/product.entity';
import { Category } from '../domain/model/category.entity';

import { ProductApi } from '../infrastructure/product-api';
import { CategoryApi } from '../infrastructure/category-api';
import { Lot } from '../domain/model/lot.entity';
import { LotApi } from '../infrastructure/lot-api';
import { InventoryMovement } from '../domain/model/inventory-movement.entity';
import { InventoryMovementApi } from '../infrastructure/inventory-movement-api';
import { PhysicalCount } from '../domain/model/physical-count.entity';
import { PhysicalCountApi } from '../infrastructure/physical-count-api';

@Injectable({
  providedIn: 'root',
})
export class InventoryStore {
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly lotApi = inject(LotApi);
  private readonly movementApi = inject(InventoryMovementApi);
  private readonly physicalCountApi = inject(PhysicalCountApi);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly lotsSignal = signal<Lot[]>([]);
  private readonly lotsLoadingSignal = signal(false);
  private readonly lotsErrorSignal = signal<string | null>(null);
  private readonly movementsSignal = signal<InventoryMovement[]>([]);
  private readonly movementsLoadingSignal = signal(false);
  private readonly movementsErrorSignal = signal<string | null>(null);
  private readonly physicalCountsSignal = signal<PhysicalCount[]>([]);
  private readonly physicalCountsLoadingSignal = signal(false);
  private readonly physicalCountsErrorSignal = signal<string | null>(null);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly lots = this.lotsSignal.asReadonly();
  readonly lotsLoading = this.lotsLoadingSignal.asReadonly();
  readonly lotsError = this.lotsErrorSignal.asReadonly();
  readonly movements = this.movementsSignal.asReadonly();
  readonly movementsLoading = this.movementsLoadingSignal.asReadonly();
  readonly movementsError = this.movementsErrorSignal.asReadonly();
  readonly physicalCounts = this.physicalCountsSignal.asReadonly();
  readonly physicalCountsLoading = this.physicalCountsLoadingSignal.asReadonly();
  readonly physicalCountsError = this.physicalCountsErrorSignal.asReadonly();

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
        this.physicalCountsErrorSignal.set('Could not load physical counts. Please try again.');
      },
    });
  }

  createPhysicalCount(count: PhysicalCount): void {
    this.physicalCountsErrorSignal.set(null);
    this.physicalCountApi.create(count).subscribe({
      next: (createdCount) => this.physicalCountsSignal.update((counts) => [createdCount, ...counts]),
      error: () => this.physicalCountsErrorSignal.set('Could not save the physical count. Please try again.'),
    });
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
        this.movementsErrorSignal.set('Could not load movements. Please try again.');
      },
    });
  }

  createMovement(movement: InventoryMovement): void {
    this.movementsErrorSignal.set(null);
    this.movementApi.create(movement).subscribe({
      next: (createdMovement) =>
        this.movementsSignal.update((movements) => [createdMovement, ...movements]),
      error: () => this.movementsErrorSignal.set('Could not create the movement. Please try again.'),
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
        this.lotsErrorSignal.set('Could not load lots. Please try again.');
      },
    });
  }

  createLot(lot: Lot): void {
    this.lotsErrorSignal.set(null);
    this.lotApi.create(lot).subscribe({
      next: (createdLot) => this.lotsSignal.update((lots) => [...lots, createdLot]),
      error: () => this.lotsErrorSignal.set('Could not create the lot. Please try again.'),
    });
  }

  updateLot(lot: Lot): void {
    this.lotsErrorSignal.set(null);
    this.lotApi.update(lot).subscribe({
      next: (updatedLot) =>
        this.lotsSignal.update((lots) =>
          lots.map((currentLot) => (currentLot.id === updatedLot.id ? updatedLot : currentLot)),
        ),
      error: () => this.lotsErrorSignal.set('Could not update the lot. Please try again.'),
    });
  }

  deleteLot(id: number): void {
    this.lotsErrorSignal.set(null);
    this.lotApi.delete(id).subscribe({
      next: () => this.lotsSignal.update((lots) => lots.filter((lot) => lot.id !== id)),
      error: () => this.lotsErrorSignal.set('Could not delete the lot. Please try again.'),
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
