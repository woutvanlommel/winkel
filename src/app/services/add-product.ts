import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ProductFormData {
  name: string;
  listId: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class AddProduct {
  private baseUrl = `${environment.supabaseUrl}/rest/v1`;
  private headers = {
    'apikey': environment.supabaseKey,
    'Authorization': `Bearer ${environment.supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  submitted = false;

  async addProduct(formData: ProductFormData): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/Products`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ 
          product: formData.name, 
          winkelwagen_id: formData.listId,
          gekocht: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Success:', data);
      this.submitted = true;
      return data[0];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

}
