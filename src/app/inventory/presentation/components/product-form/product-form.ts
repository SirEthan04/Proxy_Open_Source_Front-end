import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../domain/model/product.entity';
import { Category } from '../../../domain/model/category.entity';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly categories = input.required<Category[]>();

  //readonly productCreated = output<Product>();

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
    minimumStock: [0, [Validators.required, Validators.min(0)]],
    active: [true],
  });
  readonly product = input<Product | null>(null);

  readonly productSaved = output<Product>();

  constructor() {
    effect(() => {
      const product = this.product();

      if (product) {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          price: product.price,
          minimumStock: product.minimumStock,
          active: product.active,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    const currentProduct = this.product();

    const product = new Product(
      currentProduct?.id ?? 0,
      currentProduct?.businessId ?? 1,
      Number(value.categoryId),
      value.name,
      value.description,
      Number(value.price),
      Number(value.minimumStock),
      value.active,
    );

    this.productSaved.emit(product);

    this.form.reset({
      name: '',
      description: '',
      categoryId: 0,
      price: 0,
      minimumStock: 0,
      active: true,
    });
  }
}
