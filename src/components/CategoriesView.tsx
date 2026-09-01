import React, { useState } from 'react';
import { Category, User } from '../types/index.js';
import { Plus, Boxes, X, Tag } from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  currentUser: User | null;
  onCreateCategory: (name: string, description: string) => Promise<void>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  currentUser,
  onCreateCategory,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreateCategory(name, description);
      setName('');
      setDescription('');
      setShowAddModal(false);
    } catch (err: any) {
      alert(`Category creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assets & Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational taxonomy and assets classification structure.
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium text-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset Type</span>
          </button>
        )}
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <Boxes className="w-4 h-4 text-sky-600" />
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Active
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 mb-1">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{cat.description}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              ID: {cat.id}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-5 shadow-lg space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Create Asset / Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what belongs in this category..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold cursor-pointer shadow-2xs"
                >
                  {loading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
