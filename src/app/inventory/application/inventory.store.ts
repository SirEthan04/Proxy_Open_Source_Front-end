import { inject, Injectable, signal } from '@angular/core';

import { Product } from '../domain/model/product.entity';
import { Category } from '../domain/model/category.entity';

import { ProductApi } from '../infrastructure/product-api';
import { CategoryApi } from '../infrastructure/category-api';
import { InventoryMovement } from '../domain/model/inventory-movement.entity';
import { Lot } from '../domain/model/lot.entity';
import { MovementApi } from '../infrastructure/movement-api';
import { LotApi } from '../infrastructure/lot-api';

@Injectable({
  providedIn: 'root',
})
export class InventoryStore {
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly movementApi = inject(MovementApi);
  private readonly lotApi = inject(LotApi);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly lotsSignal = signal<Lot[]>([]);
  private readonly lotsLoadingSignal = signal(false);
  private readonly lotsErrorSignal = signal<string | null>(null);
  private readonly movementsSignal = signal<InventoryMovement[]>([]);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly lots = this.lotsSignal.asReadonly();
  readonly lotsLoading = this.lotsLoadingSignal.asReadonly();
  readonly lotsError = this.lotsErrorSignal.asReadonly();
  readonly movements = this.movementsSignal.asReadonly();

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

  loadMovements(): void {
    this.movementApi.getAll().subscribe({ next: movements => this.movementsSignal.set(movements), error: error => console.error('Error loading movements:', error) });
  }

  createMovement(movement: InventoryMovement): void {
    this.movementApi.create(movement).subscribe({
      next: created => this.movementsSignal.update(movements => [created, ...movements]),
      error: error => console.error('Error creating movement:', error),
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

