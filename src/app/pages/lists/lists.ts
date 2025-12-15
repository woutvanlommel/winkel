import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AddProduct } from '../../services/add-product';
import { ListService, List } from '../../services/list';
import { environment } from '../../../environments/environment';

interface ListWithUI extends List {
  showAddProduct?: boolean;
  newProductName?: string;
}

@Component({
  selector: 'app-lists',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists implements OnInit {
  private baseUrl = `${environment.supabaseUrl}/rest/v1`;
  private headers = {
    'apikey': environment.supabaseKey,
    'Authorization': `Bearer ${environment.supabaseKey}`,
    'Content-Type': 'application/json'
  };

  lists: ListWithUI[] = [];
  loading = false;
  error = '';
  showAddList = false;
  newListName = '';

  constructor(
    private addProductService: AddProduct,
    private listService: ListService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadLists();
  }

  async loadLists() {
    try {
      this.loading = true;
      this.error = '';
      
      console.log('Fetching lists from backend...');
      const lists = await this.listService.getLists();
      console.log('Received lists:', lists);
      
      this.lists = lists.map(list => ({
        ...list,
        showAddProduct: false,
        newProductName: ''
      }));
      
      if (this.lists.length === 0) {
        console.warn('No lists returned from backend');
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      this.error = 'Kon lijsten niet laden: ' + (error instanceof Error ? error.message : 'Onbekende fout');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  toggleAddList() {
    this.showAddList = !this.showAddList;
    if (!this.showAddList) {
      this.newListName = '';
    }
  }

  async createList() {
    if (!this.newListName.trim()) return;

    try {
      await this.listService.createList(this.newListName);
      this.newListName = '';
      this.showAddList = false;
      await this.loadLists();
    } catch (error) {
      console.error('Create list error:', error);
      alert('Kon lijst niet aanmaken. Check de console voor details.');
    }
  }

  toggleAddProduct(list: ListWithUI) {
    list.showAddProduct = !list.showAddProduct;
    if (!list.showAddProduct) {
      list.newProductName = '';
    }
  }

  async addProduct(list: ListWithUI) {
    if (!list.newProductName?.trim()) return;

    try {
      await this.addProductService.addProduct({
        name: list.newProductName,
        listId: list.id
      });
      
      list.newProductName = '';
      list.showAddProduct = false;
      alert('Product toegevoegd aan ' + list.winkelwagen);
    } catch (error) {
      alert('Kon product niet toevoegen');
    }
  }

  async deleteList(list: ListWithUI) {
    if (!confirm(`Weet je zeker dat je "${list.winkelwagen}" wilt verwijderen?`)) return;

    try {
      const response = await fetch(`${this.baseUrl}/Winkelwagens?id=eq.${list.id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      await this.loadLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Kon lijst niet verwijderen');
    }
  }
}
