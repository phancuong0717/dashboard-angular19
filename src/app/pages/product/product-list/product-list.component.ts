import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule, NzTableSortFn } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

interface ProductData {
  id: number;
  productName: string;
  productCode: string;
  productPrice: number;
  productQuantity: number;
  productStatus: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    ReactiveFormsModule,
  ],
})
export class ProductListComponent implements OnInit {
  listOfData: readonly ProductData[] = [];
  productForm: FormGroup;
  selectedProductId: number | null = null;
  sortName: string | null = null;
  sortValue: string | null = null;
  isVisible: boolean = false;
  isOkLoading: boolean = false;
  isEditMode: boolean = false;
  modalTitle: string = '';
  isAddMode: boolean = false;

  // ================================
  // =======init data table======
  ngOnInit(): void {
    this.listOfData = new Array(100).fill(0).map((_, i) => ({
      id: i + 1,
      productName: `Product ${i + 1}`,
      productCode: `P-${1000 + i + 1}`,
      productPrice: parseFloat((Math.random() * 100000).toFixed(0)),
      productQuantity: Math.floor(Math.random() * 100),
      productStatus: Math.random() > 0.5 ? 'In Stock' : 'Out of Stock',
    }));
  }

  constructor(private modal: NzModalService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      productCode: ['', [Validators.required, Validators.pattern(/^P-\d+$/)]],
      productPrice: [0, [Validators.required, Validators.min(0)]],
      productQuantity: [0, [Validators.required, Validators.min(0)]],
      productStatus: ['In Stock', [Validators.required]],
    });
  }

  // ===============================
  // sort for Product Name
  sortByName: NzTableSortFn<ProductData> = (a, b) => {
    const numA = parseInt(a.productName.replace('Product ', ''), 10);
    const numB = parseInt(b.productName.replace('Product ', ''), 10);
    return numA - numB;
  };

  // sort for Product Code
  sortByCode: NzTableSortFn<ProductData> = (a, b) => {
    const numA = parseInt(a.productCode.replace('P-', ''), 10);
    const numB = parseInt(b.productCode.replace('P-', ''), 10);
    return numA - numB;
  };

  // handle sort change
  onSortChange(sort: { key: string; value: string | null }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
  }

  sortData(data: readonly ProductData[]): ProductData[] {
    if (!this.sortName || !this.sortValue) {
      return [...data];
    }
    return [...data].sort((a, b) => {
      const isAsc = this.sortValue === 'ascend';
      if (this.sortName === 'productName') {
        const numA = parseInt(a.productName.replace('Product ', ''), 10);
        const numB = parseInt(b.productName.replace('Product ', ''), 10);
        return isAsc ? numA - numB : numB - numA;
      }
      if (this.sortName === 'productCode') {
        const numA = parseInt(a.productCode.replace('P-', ''), 10);
        const numB = parseInt(b.productCode.replace('P-', ''), 10);
        return isAsc ? numA - numB : numB - numA;
      }
      return 0;
    });
  }
  // =========Handle actions ===========
  showAddModal(): void {
    this.isVisible = true;
    this.isEditMode = true;
    this.isAddMode = true;
    this.modalTitle = 'Add Product';
    this.productForm.reset();
    this.productForm.get('productStatus')?.clearValidators();
    this.productForm.get('productStatus')?.updateValueAndValidity();
  }

  showDetailModal(product: ProductData): void {
    this.isVisible = true;
    this.isEditMode = false;
    this.isAddMode = false;
    this.modalTitle = 'Detail Product';
    this.selectedProductId = product.id;
    this.productForm.patchValue({
      productName: product.productName,
      productCode: product.productCode,
      productPrice: product.productPrice,
      productQuantity: product.productQuantity,
      productStatus: product.productStatus,
    });
    this.productForm.get('productStatus')?.setValidators([Validators.required]);
    this.productForm.get('productStatus')?.updateValueAndValidity();
    this.productForm.disable();
  }

  switchToEditMode(): void {
    this.isEditMode = true;
    this.isAddMode = false;
    this.modalTitle = 'Edit Product';
    this.productForm.get('productStatus')?.setValidators([Validators.required]);
    this.productForm.get('productStatus')?.updateValueAndValidity();
    this.productForm.enable();
  }
  handleOk(): void {
    if (!this.isEditMode) {
      this.isVisible = false;
      this.productForm.reset();
      this.productForm.enable();
      this.productForm
        .get('productStatus')
        ?.setValidators([Validators.required]);
      this.productForm.get('productStatus')?.updateValueAndValidity();
      return;
    }

    if (this.productForm.valid) {
      this.isOkLoading = true;
      setTimeout(() => {
        if (this.selectedProductId === null) {
          // Add new product
          const newProduct: ProductData = {
            id: this.listOfData.length + 1,
            ...this.productForm.value,
            productStatus: 'In Stock',
          };
          this.listOfData = [...this.listOfData, newProduct];
        } else {
          // Update existing product
          this.listOfData = this.listOfData.map((item) =>
            item.id === this.selectedProductId
              ? { ...item, ...this.productForm.value }
              : item
          );
        }
        this.isOkLoading = false;
        this.isVisible = false;
        this.selectedProductId = null;
        this.isAddMode = false;
        this.productForm.reset();
        this.productForm
          .get('productStatus')
          ?.setValidators([Validators.required]);
        this.productForm.get('productStatus')?.updateValueAndValidity();
        this.productForm.enable();
      }, 1000);
    } else {
      Object.values(this.productForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.selectedProductId = null;
    this.isAddMode = false;
    this.productForm.reset();
    this.productForm.get('productStatus')?.setValidators([Validators.required]);
    this.productForm.get('productStatus')?.updateValueAndValidity();
    this.productForm.enable();
  }

  // handle delete
  confirmDelete?: NzModalRef;
  handleDelete(id: number) {
    this.confirmDelete = this.modal.confirm({
      nzTitle: 'Do you want to delete this product',
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.5) {
              this.listOfData = this.listOfData.filter(
                (item) => item.id !== id
              );
              resolve(true);
            } else {
              reject(new Error('Failed to delete the product'));
            }
          }, 1000);
        }).catch((error) => {
          this.modal.error({
            nzTitle: 'Error',
            nzContent:
              error.message || 'An error occurred while deleting the product',
          });
        });
      },
    });
  }
  // ======================
}
