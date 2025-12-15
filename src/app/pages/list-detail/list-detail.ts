import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListService, List } from '../../services/list';
import { AddProduct } from '../../services/add-product';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;
  product: string;
  winkelwagen_id: string;
  gekocht?: boolean;
}

@Component({
  selector: 'app-list-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list-detail.html',
  styleUrl: './list-detail.css',
})
export class ListDetail implements OnInit {
  private baseUrl = `${environment.supabaseUrl}/rest/v1`;
  private headers = {
    'apikey': environment.supabaseKey,
    'Authorization': `Bearer ${environment.supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  list: List | null = null;
  products: Product[] = [];
  loading = false;
  error = '';
  newProductName = '';

  constructor(
    private route: ActivatedRoute,
    private listService: ListService,
    private addProductService: AddProduct,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadListDetail(id);
    }
  }

  async loadListDetail(id: string | number) {
    try {
      this.loading = true;
      this.error = '';

      console.log('Loading list detail for id:', id);
      
      // Haal lijst info op
      const lists = await this.listService.getLists();
      console.log('All lists:', lists);
      
      // Vergelijk met loose equality om string/number mismatch te voorkomen
      this.list = lists.find(l => l.id == id) || null;
      console.log('Found list:', this.list);
      
      if (!this.list) {
        this.error = 'Lijst niet gevonden';
        return;
      }

      // Haal producten van deze lijst op
      await this.loadProducts(id);
    } catch (error) {
      console.error('Error loading list detail:', error);
      this.error = 'Kon lijst niet laden';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadProducts(listId: string | number) {
    try {
      console.log(`Fetching products for list ${listId}...`);
      // Filter producten op winkelwagen_id met Supabase
      const response = await fetch(
        `${this.baseUrl}/Products?winkelwagen_id=eq.${listId}&select=*`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      this.products = await response.json();
      console.log('Received products:', this.products);
      
      if (this.products.length === 0) {
        console.log('No products found for this list');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.error = 'Kon producten niet laden: ' + (error instanceof Error ? error.message : 'Onbekende fout');
      this.products = [];
    }
  }

  async addProduct() {
    if (!this.newProductName.trim() || !this.list) return;

    try {
      await this.addProductService.addProduct({
        name: this.newProductName,
        listId: this.list.id
      });
      
      this.newProductName = '';
      await this.loadProducts(this.list.id);
    } catch (error) {
      alert('Kon product niet toevoegen');
    }
  }

  async deleteProduct(productId: string) {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

    try {
      const response = await fetch(`${this.baseUrl}/Products?id=eq.${productId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (this.list) {
        await this.loadProducts(this.list.id);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Kon product niet verwijderen');
    }
  }

  async toggleProductCheck(product: Product) {
    try {
      const response = await fetch(`${this.baseUrl}/Products?id=eq.${product.id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ gekocht: !product.gekocht })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      product.gekocht = !product.gekocht;
    } catch (error) {
      console.error('Error toggling product:', error);
      alert('Kon product status niet updaten');
    }
  }

  async deleteList() {
    if (!confirm(`Weet je zeker dat je "${this.list?.winkelwagen}" wilt verwijderen?`)) return;

    try {
      const response = await fetch(`${this.baseUrl}/Winkelwagens?id=eq.${this.list?.id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Redirect terug naar overzicht
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Kon lijst niet verwijderen');
    }
  }
}
