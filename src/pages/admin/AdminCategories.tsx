import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, X } from 'lucide-react';
import { Category } from '../../types';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { HEADPHONES_IMAGE, CHAIR_IMAGE, WATCH_IMAGE, HERO_BANNER_IMAGE } from '../../data/mockData';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(HEADPHONES_IMAGE);
  const [isActive, setIsActive] = useState(true);

  const toast = useToast();

  const loadCategories = async () => {
    setLoading(true);
    const data = await productService.getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage(HEADPHONES_IMAGE);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCategory) {
      await productService.updateCategory(editingCategory.id, {
        name,
        slug: generatedSlug,
        description,
        image,
        isActive,
      });
      toast.success(`Category "${name}" updated.`);
    } else {
      await productService.createCategory({
        name,
        slug: generatedSlug,
        description,
        image,
        isActive,
      });
      toast.success(`Category "${name}" created.`);
    }

    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id: string, catName: string) => {
    await productService.deleteCategory(id);
    toast.info(`Category "${catName}" removed.`);
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize catalog taxonomy, store navigation hierarchies, and department descriptions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-950 rounded-xl border border-slate-800/80 p-5 flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-16 h-16 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                />
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    cat.isActive
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
              <span className="text-[11px] font-mono text-slate-500 block mb-2">
                /{cat.slug} · {cat.itemCount} Objects
              </span>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-900 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="py-1 px-2.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create Store Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Slug URL</label>
                <input
                  type="text"
                  placeholder="e.g. acoustics-studio"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Cover Image Asset</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Audio', url: HEADPHONES_IMAGE },
                    { label: 'Chair', url: CHAIR_IMAGE },
                    { label: 'Watch', url: WATCH_IMAGE },
                    { label: 'Living', url: HERO_BANNER_IMAGE },
                  ].map((img) => (
                    <button
                      type="button"
                      key={img.label}
                      onClick={() => setImage(img.url)}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        image === img.url
                          ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-950/40'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-12 object-cover rounded" />
                      <span className="text-[10px] text-slate-400 mt-1 block">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCat"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="activeCat" className="text-slate-300 cursor-pointer">
                  Active in customer storefront navigation
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
