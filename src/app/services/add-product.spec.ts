import { TestBed } from '@angular/core/testing';

import { AddProduct } from './add-product';

describe('AddProduct', () => {
  let service: AddProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
