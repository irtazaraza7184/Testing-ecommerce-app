import { Product, Category } from '../types';
import { storage } from './storageService';
import { firestoreService } from './firestoreService';

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
    let items: Product[] = [];
    try {
      items = await firestoreService.getProducts();
      if (!items || items.length === 0) {
        items = storage.getProducts();
      } else {
        storage.saveProducts(items);
      }
    } catch {
      items = storage.getProducts();
    }

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
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (params.brand && params.brand !== 'all') {
      items = items.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    if (params.minPrice !== undefined) {
      items = items.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= params.maxPrice!);
    }

    if (params.rating !== undefined && params.rating > 0) {
      items = items.filter((p) => p.rating >= params.rating!);
    }

    if (params.inStockOnly) {
      items = items.filter((p) => p.inStock && p.stock > 0);
    }

    if (params.sort) {
      switch (params.sort) {
        case 'price-asc':
          items = [...items].sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          items = [...items].sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          items = [...items].sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          items = [...items].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'best-selling':
          items = [...items].sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case 'featured':
        default:
          items = [...items].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return items;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const cloudItem = await firestoreService.getProductById(id);
      if (cloudItem) return cloudItem;
    } catch {
      // fallback
    }
    const products = storage.getProducts();
    return products.find((p) => p.id === id || p.slug === id) || null;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.getProductById(slug);
  },

  async getCategories(): Promise<Category[]> {
    try {
      const cats = await firestoreService.getCategories();
      if (cats && cats.length > 0) {
        storage.saveCategories(cats);
        return cats;
      }
    } catch {
      // fallback
    }
    return storage.getCategories();
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      inStock: productData.stock > 0,
    };

    // Save to Firestore
    await firestoreService.saveProduct(newProduct);

    // Save to local cache
    const products = storage.getProducts();
    storage.saveProducts([newProduct, ...products]);

    // Update category count
    const categories = await this.getCategories();
    const cat = categories.find((c) => c.name === newProduct.category || c.id === newProduct.categoryId);
    if (cat) {
      cat.itemCount += 1;
      await firestoreService.updateCategory(cat.id, { itemCount: cat.itemCount });
      storage.saveCategories(categories);
    }

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await firestoreService.updateProduct(id, updates);

    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates };
    storage.saveProducts(products);
    return products[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    await firestoreService.deleteProduct(id);

    const products = storage.getProducts();
    const item = products.find((p) => p.id === id);
    storage.saveProducts(products.filter((p) => p.id !== id));

    if (item) {
      const categories = await this.getCategories();
      const cat = categories.find((c) => c.name === item.category || c.id === item.categoryId);
      if (cat && cat.itemCount > 0) {
        cat.itemCount -= 1;
        await firestoreService.updateCategory(cat.id, { itemCount: cat.itemCount });
        storage.saveCategories(categories);
      }
    }
    return true;
  },

  async adjustStock(productId: string, delta: number, reason: string): Promise<Product | null> {
    const products = storage.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    const newStock = Math.max(0, product.stock + delta);
    product.stock = newStock;
    product.inStock = newStock > 0;
    storage.saveProducts(products);

    // Update Firestore product and log
    await firestoreService.updateProduct(productId, { stock: newStock, inStock: newStock > 0 });

    return product;
  },

  async createCategory(cat: Omit<Category, 'id' | 'itemCount'>): Promise<Category> {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}`, itemCount: 0 };
    await firestoreService.saveCategory(newCat);
    const categories = storage.getCategories();
    storage.saveCategories([...categories, newCat]);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await firestoreService.updateCategory(id, updates);
    const categories = storage.getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    categories[idx] = { ...categories[idx], ...updates };
    storage.saveCategories(categories);
    return categories[idx];
  },

  async deleteCategory(id: string): Promise<boolean> {
    await firestoreService.deleteCategory(id);
    const categories = storage.getCategories();
    storage.saveCategories(categories.filter((c) => c.id !== id));
    return true;
  },
};
