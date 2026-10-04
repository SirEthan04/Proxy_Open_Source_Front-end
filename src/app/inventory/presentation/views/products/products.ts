import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InventoryStore } from '../../../application/inventory.store';
import { Product } from '../../../domain/model/product.entity';

import { ProductList } from '../../components/product-list/product-list';
import { ProductDialog, ProductDialogData } from '../../components/product-dialog/product-dialog';

@Component({
  selector: 'app-products',
  imports: [ProductList, MatButtonModule, MatIconModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly dialog = inject(MatDialog);

  readonly products = this.inventoryStore.products;
  readonly categories = this.inventoryStore.categories;

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.inventoryStore.loadCategories();
  }

  onCreate(): void {
    this.openProductDialog(null);
  }

  onEdit(product: Product): void {
    this.openProductDialog(product);
  }

  onDelete(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    this.inventoryStore.deleteProduct(product.id);
  }

  private openProductDialog(product: Product | null): void {
    const data: ProductDialogData = {
      product,
      categories: this.categories(),
    };

    const dialogRef = this.dialog.open(ProductDialog, {
      data,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      if (result.id === 0) {
        this.inventoryStore.createProduct(result);
      } else {
        this.inventoryStore.updateProduct(result);
      }
    });
  }
}
