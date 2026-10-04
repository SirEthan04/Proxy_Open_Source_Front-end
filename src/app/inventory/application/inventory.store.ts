import { inject, Injectable, signal } from '@angular/core';

import { Product } from '../domain/model/product.entity';
import { Category } from '../domain/model/category.entity';

import { ProductApi } from '../infrastructure/product-api';
import { CategoryApi } from '../infrastructure/category-api';

@Injectable({
  providedIn: 'root',
})
export class InventoryStore {
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);

  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();

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

