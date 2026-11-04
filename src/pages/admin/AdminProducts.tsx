import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  AlertCircle,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { HEADPHONES_IMAGE, CHAIR_IMAGE, WATCH_IMAGE, HERO_BANNER_IMAGE } from '../../data/mockData';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const toast = useToast();

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('AURA Atelier');
  const [category, setCategory] = useState('Acoustics & Studio');
  const [price, setPrice] = useState<number>(299);
  const [originalPrice, setOriginalPrice] = useState<number>(350);
  const [stock, setStock] = useState<number>(20);
  const [sku, setSku] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>(HEADPHONES_IMAGE);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const availableImages = [
    { label: 'Studio ANC Headphones', url: HEADPHONES_IMAGE },
    { label: 'Oak Lounge Armchair', url: CHAIR_IMAGE },
    { label: 'Titanium Chronograph', url: WATCH_IMAGE },
    { label: 'Architectural Lantern', url: HERO_BANNER_IMAGE },
  ];

  const loadAll = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      productService.getProducts(),
      productService.getCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('AURA Atelier');
    setCategory(categories[0]?.name || 'Acoustics & Studio');
    setPrice(195);
    setOriginalPrice(220);
    setStock(15);
    setSku(`AUR-PRD-${Math.floor(100 + Math.random() * 900)}`);
    setShortDescription('');
    setDescription('');
    setSelectedImage(HEADPHONES_IMAGE);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setStock(p.stock);
    setSku(p.sku);
    setShortDescription(p.shortDescription || '');
    setDescription(p.description);
    setSelectedImage(p.images[0]);
    setIsFeatured(!!p.isFeatured);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    const discountPercentage =
      originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const catObj = categories.find((c) => c.name === category);

    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, {
        name,
        brand,
        category,
        categoryId: catObj?.id || 'cat-audio',
        price,
        originalPrice,
        discountPercentage,
        stock,
        sku,
        shortDescription,
        description,
        images: [selectedImage],
        isFeatured,
      });
      toast.success(`Updated "${name}" successfully.`);
    } else {
      await productService.createProduct({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand,
        category,
        categoryId: catObj?.id || 'cat-audio',
        price,
        originalPrice,
        discountPercentage,
        rating: 5.0,
        reviewCount: 1,
        stock,
        sku,
        shortDescription,
        description,
        images: [selectedImage],
        specifications: {
          'Origin': 'Handcrafted in Atelier',
          'Warranty': '3 Years Direct Guarantee',
        },
        isFeatured,
        inStock: stock > 0,
      });
      toast.success(`Added "${name}" to product catalog.`);
    }

    setIsModalOpen(false);
    loadAll();
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    await productService.deleteProduct(productToDelete.id);
    toast.info(`Deleted "${productToDelete.name}".`);
    setProductToDelete(null);
    loadAll();
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === 'all' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase() ||
      p.categoryId === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Product Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain catalog pricing, inventory allocation, and featured collections
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, SKU, atelier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs py-2 px-3 rounded-lg focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-mono">
            {filteredProducts.length} items
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product Object</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded bg-slate-800 border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate">{p.name}</span>
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                          {p.brand}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                  <td className="py-3 px-4">{p.category}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ${p.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.stock <= 5
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.isFeatured ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Product Object' : 'Create New Catalog Object'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Brand / Atelier</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Original / MSRP Price ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Image Selection from Generated Store Assets */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Select Product Visual Asset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableImages.map((img) => (
                    <button
                      type="button"
                      key={img.label}
                      onClick={() => setSelectedImage(img.url)}
                      className={`p-2 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all ${
                        selectedImage === img.url
                          ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-14 h-14 object-cover rounded" />
                      <span className="text-[10px] text-slate-300 text-center line-clamp-1">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Short One-line Teaser</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Key acoustic or ergonomic highlight"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featuredToggle" className="text-slate-300 cursor-pointer">
                  Feature in homepage showcase grid
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setProductToDelete(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Delete Product</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? This action
              cannot be undone.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
