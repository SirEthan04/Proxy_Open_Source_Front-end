import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Product } from '../../../domain/model/product.entity';
import { Category } from '../../../domain/model/category.entity';
import { ProductForm } from '../product-form/product-form';

export interface ProductDialogData {
  product: Product | null;
  categories: Category[];
}

@Component({
  selector: 'app-product-dialog',
  imports: [TranslatePipe, MatDialogModule, MatButtonModule, ProductForm],
  templateUrl: './product-dialog.html',
  styleUrl: './product-dialog.css',
})
export class ProductDialog {
  readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject(MatDialogRef<ProductDialog>);

  onProductSaved(product: Product): void {
    this.dialogRef.close(product);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
