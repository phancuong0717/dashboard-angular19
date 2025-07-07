import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hello',
  templateUrl: './product-detail-modal.component.html',
  styleUrl: './product-detail-modal.component.scss',
  standalone: true,
})
export class ProductDetailComponent {
  productId: number = 0;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.productId = id ? +id : 0;
    });
  }
}
