import { Component, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { InventoryStore } from '../../../application/inventory.store';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly iamStore = inject(IamStore);

  // Signals existentes
  readonly products = this.inventoryStore.products;
  readonly categories = this.inventoryStore.categories;
  readonly currentUser = this.iamStore.currentUser;

  // Estadísticas derivadas
  readonly totalProducts = computed(() => this.products().length);

  readonly activeProducts = computed(
    () => this.products().filter((product) => product.active).length,
  );

  readonly inactiveProducts = computed(
    () => this.products().filter((product) => !product.active).length,
  );

  readonly totalCategories = computed(() => this.categories().length);

  // No son "recientes" porque Product no tiene createdAt.
  // Solo mostramos una parte del catálogo registrado.
  readonly displayedProducts = computed(() => this.products().slice(0, 5));

  // Cantidad de productos por categoría
  readonly productsByCategory = computed(() =>
    this.categories().map((category) => ({
      id: category.id,
      name: category.name,
      total: this.products().filter((product) => product.categoryId === category.id).length,
    })),
  );

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.inventoryStore.loadCategories();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories().find((category) => category.id === categoryId);

    return category?.name ?? 'Sin categoría';
  }
}
