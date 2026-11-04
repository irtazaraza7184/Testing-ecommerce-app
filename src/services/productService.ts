import { Product, Category } from '../types';
import { storage } from './storageService';
import { api } from './api';

export interface ProductFilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'best-selling';
  inStockOnly?: boolean;
}

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params?.rating !== undefined) query.set('rating', String(params.rating));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.inStockOnly) query.set('inStockOnly', 'true');

    const qs = query.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;

    return api.get<Product[]>(endpoint, () => {
      let items = storage.getProducts();
      if (!params) return items;
      if (params.category && params.category !== 'all') {
        items = items.filter(
          (p) =>
            p.category.toLowerCase() === params.category!.toLowerCase() ||
            p.categoryId === params.category
        );
      }
      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      return items;
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    return api.get<Product | null>(`/products/${id}`, () => {
      const prods = storage.getProducts();
      return prods.find((p) => p.id === id || p.slug === id) || null;
    });
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.getProductById(slug);
  },

  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>('/categories', () => storage.getCategories());
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return api.post<Product>('/products', productData, () => {
      const products = storage.getProducts();
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        inStock: productData.stock > 0,
      };
      storage.saveProducts([newProduct, ...products]);
      return newProduct;
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return api.put<Product | null>(`/products/${id}`, updates, () => {
      const products = storage.getProducts();
      const idx = products.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      products[idx] = { ...products[idx], ...updates };
      storage.saveProducts(products);
      return products[idx];
    });
  },

  async deleteProduct(id: string): Promise<boolean> {
    return api.delete<{ success: boolean }>(`/products/${id}`, () => {
      const products = storage.getProducts();
      storage.saveProducts(products.filter((p) => p.id !== id));
      return { success: true };
    }).then(() => true);
  },

  async adjustStock(productId: string, delta: number, reason: string): Promise<Product | null> {
    return api.post<Product | null>(`/products/${productId}/adjust-stock`, { delta, reason }, () => {
      const products = storage.getProducts();
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      product.stock = Math.max(0, product.stock + delta);
      product.inStock = product.stock > 0;
      storage.saveProducts(products);
      return product;
    });
  },

  async createCategory(cat: Omit<Category, 'id' | 'itemCount'>): Promise<Category> {
    return api.post<Category>('/categories', cat, () => {
      const categories = storage.getCategories();
      const newCat: Category = { ...cat, id: `cat-${Date.now()}`, itemCount: 0 };
      storage.saveCategories([...categories, newCat]);
      return newCat;
    });
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    return api.put<Category | null>(`/categories/${id}`, updates, () => {
      const categories = storage.getCategories();
      const idx = categories.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      categories[idx] = { ...categories[idx], ...updates };
      storage.saveCategories(categories);
      return categories[idx];
    });
  },

  async deleteCategory(id: string): Promise<boolean> {
    return api.delete<{ success: boolean }>(`/categories/${id}`, () => {
      const categories = storage.getCategories();
      storage.saveCategories(categories.filter((c) => c.id !== id));
      return { success: true };
    }).then(() => true);
  },
};
