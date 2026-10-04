import { InventoryStore } from '../../../application/inventory.store';
import { Product } from '../../../domain/model/product.entity';

import { ProductList } from '../../components/product-list/product-list';
import { ProductForm } from '../../components/product-form/product-form';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-products',
  imports: [ProductList, ProductForm],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);

  readonly products = this.inventoryStore.products;
  readonly categories = this.inventoryStore.categories;
  readonly selectedProduct = signal<Product | null>(null);

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.inventoryStore.loadCategories();
  }

  onProductSaved(product: Product): void {
    if (product.id === 0) {
      this.inventoryStore.createProduct(product);
    } else {
      this.inventoryStore.updateProduct(product);
      this.selectedProduct.set(null);
    }
  }

  onEdit(product: Product): void {
    this.selectedProduct.set(product);
  }
  onDelete(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    this.inventoryStore.deleteProduct(product.id);
  }
}
