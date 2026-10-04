import { Component, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '../../../domain/model/product.entity';
import { Category } from '../../../domain/model/category.entity';

@Component({
  selector: 'app-product-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList {

  readonly products = input.required<Product[]>();
  readonly categories = input.required<Category[]>();

  readonly edit = output<Product>();
  readonly remove = output<Product>();

  readonly displayedColumns: string[] = [
    'name',
    'category',
    'price',
    'minimumStock',
    'status',
    'actions'
  ];

  getCategoryName(categoryId: number): string {
    const category = this.categories()
      .find(category => category.id === categoryId);

    return category?.name ?? 'Unknown';
  }

  onEdit(product: Product): void {
    this.edit.emit(product);
  }

  onDelete(product: Product): void {
    this.remove.emit(product);
  }
}
