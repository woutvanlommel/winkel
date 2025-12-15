import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  product: string;
  winkelwagen_id: string;
  gekocht?: boolean;
}

export interface List {
  id: string;
  winkelwagen: string;
  producten?: Product[];
}

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private baseUrl = `${environment.supabaseUrl}/rest/v1`;
  private headers = {
    'apikey': environment.supabaseKey,
    'Authorization': `Bearer ${environment.supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  async getLists(): Promise<List[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Winkelwagens?select=*`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading lists:', error);
      throw error;
    }
  }

  async createList(naam: string): Promise<List> {
    try {
      const response = await fetch(`${this.baseUrl}/Winkelwagens`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ winkelwagen: naam })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      return result[0];
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }
}
