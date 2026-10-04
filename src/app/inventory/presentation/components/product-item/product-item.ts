import { Component, input, output } from '@angular/core';
import { Product } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-product-item',
  imports: [],
  templateUrl: './product-item.html',
  styleUrl: './product-item.css',
})
export class ProductItem {
  readonly product = input.required<Product>();

  readonly edit = output<Product>();
  readonly remove = output<Product>();

  onEdit(): void {
    this.edit.emit(this.product());
  }
  onDelete(): void {
    this.remove.emit(this.product());
  }
}
