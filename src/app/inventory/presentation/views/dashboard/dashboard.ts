import { Component, computed, inject, OnInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { InventoryStore } from '../../../application/inventory.store';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);

  readonly products = this.inventoryStore.products;

  readonly categories = this.inventoryStore.categories;

  readonly totalProducts = computed(() => this.products().length);

  readonly activeProducts = computed(
    () => this.products().filter((product) => product.active).length,
  );

  readonly totalCategories = computed(() => this.categories().length);

  readonly recentProducts = computed(() => this.products().slice(-5).reverse());

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.inventoryStore.loadCategories();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories().find((category) => category.id === categoryId);

    return category?.name ?? 'Unknown';
  }
}
