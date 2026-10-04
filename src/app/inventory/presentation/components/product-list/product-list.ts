import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../domain/model/product.entity';
import { Category } from '../../../domain/model/category.entity';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-product-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  readonly products = input.required<Product[]>();
  readonly categories = input.required<Category[]>();
  readonly searchTerm = signal('');
  readonly edit = output<Product>();
  readonly remove = output<Product>();

  readonly displayedColumns: string[] = [
    'name',
    'category',
    'price',
    'minimumStock',
    'status',
    'actions',
  ];
  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.products();
    }

    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        this.getCategoryName(product.categoryId).toLowerCase().includes(term),
    );
  });

  getCategoryName(categoryId: number): string {
    const category = this.categories().find((category) => category.id === categoryId);

    return category?.name ?? 'Unknown';
  }

  onEdit(product: Product): void {
    this.edit.emit(product);
  }

  onDelete(product: Product): void {
    this.remove.emit(product);
  }
}
