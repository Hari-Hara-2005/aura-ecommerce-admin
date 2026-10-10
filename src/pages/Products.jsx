import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { productService } from '../services/api';
import {
  Package, Search, Plus, Eye, Edit3, Trash2, X,
  CheckCircle2, AlertTriangle, Star, IndianRupee
} from 'lucide-react';
import { formatINR } from '../utils/format';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');

  const [newProduct, setNewProduct] = useState({
    title: '',
    name: '',
    description: '',
    price: '',
    stock: 10,
    category_id: '',
    image: '',
    thumbnail: '',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, cats] = await Promise.all([
        productService.getProducts({ limit: 50 }),
        productService.getCategories()
      ]);
      setProducts(prodRes.products || []);
      setCategories(cats || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        String(p.id).includes(q);

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      let matchStock = true;
      if (stockFilter === 'IN_STOCK') matchStock = (p.stock || 0) > 10;
      else if (stockFilter === 'LOW_STOCK') matchStock = (p.stock || 0) > 0 && (p.stock || 0) <= 10;
      else if (stockFilter === 'OUT_OF_STOCK') matchStock = (p.stock || 0) === 0;

      return matchSearch && matchCategory && matchStock;
    });

    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating_desc') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'stock_desc') list.sort((a, b) => (b.stock || 0) - (a.stock || 0));

    return list;
  }, [products, search, selectedCategory, stockFilter, sortBy]);

  const totalItems = products.length;
  const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
  const avgPrice = totalItems > 0 ? (products.reduce((a, b) => a + (b.price || 0), 0) / totalItems) : 0;

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    try {
      const defaultCatId = typeof categories[0] === 'object' ? categories[0]?.id : categories[0];
      const selectedCatId = newProduct.category_id || defaultCatId;

      await productService.saveLocalProduct({
        ...newProduct,
        category_id: selectedCatId,
      });

      showToast(`Added product "${newProduct.title}" successfully!`);
      setShowAddModal(false);
      setNewProduct({
        title: '',
        name: '',
        description: '',
        price: '',
        stock: 10,
        category_id: defaultCatId || '',
        image: '',
        thumbnail: '',
      });
      loadData();
    } catch (err) {
      showToast(`Failed to add product: ${err.message}`);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    try {
      await productService.saveLocalProduct({
        ...editProduct,
        name: editProduct.title || editProduct.name,
        price: parseFloat(editProduct.price) || 0,
        stock: parseInt(editProduct.stock) || 0,
        category_id: editProduct.category_id,
      });
      setEditProduct(null);
      showToast(`Updated "${editProduct.title || editProduct.name}" successfully!`);
      loadData();
    } catch (err) {
      showToast(`Failed to update product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (window.confirm(`Delete product "${title}"?`)) {
      try {
        await productService.deleteLocalProduct(id);
        if (viewProduct?.id === id) setViewProduct(null);
        showToast(`Deleted product "${title}"`);
        loadData();
      } catch (err) {
        showToast(`Failed to delete product: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header title="Products Management" subtitle="Manage store catalog, stock thresholds, pricing, and product specifications." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Catalog Count</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">Active listed products</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Low Stock Warning</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">&le; 10 units remaining</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Out of Stock</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{outOfStockCount}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">Needs immediate reorder</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Average Unit Price</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(avgPrice)}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">Across active catalog</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, SKU..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-violet-500 capitalize"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => {
                const name = typeof c === 'object' ? c.name : c;
                return <option key={typeof c === 'object' ? c.id : c} value={name}>{name}</option>;
              })}
            </select>

            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-violet-500"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt;10)</option>
              <option value="LOW_STOCK">Low Stock (&le;10)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-violet-500"
            >
              <option value="default">Default Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="stock_desc">Highest Stock</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading product catalog...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">Product Info</th>
                    <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">Inventory</th>
                    <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">Rating</th>
                    <th className="text-right px-6 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    const isLow = (product.stock || 0) > 0 && (product.stock || 0) <= 10;
                    const isOut = (product.stock || 0) === 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/70 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=128&q=80'}
                              alt={product.title}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-violet-500/30 transition bg-slate-50"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=128&q=80'; }}
                            />
                            <div className="max-w-xs">
                              <p className="text-slate-900 font-semibold text-sm truncate group-hover:text-violet-600 transition">{product.title}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                <span>{product.brand || 'AURA'}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-400">ID: {product.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold capitalize border border-slate-200">
                            {product.category?.replace('-', ' ')}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <span className="text-slate-900 font-bold text-sm">
                              {formatINR(product.price)}
                            </span>
                            {product.discountPercentage > 0 && (
                              <span className="ml-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                -{Math.round(product.discountPercentage)}%
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isOut
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              {isOut ? 'Out of stock' : `${product.stock} in stock`}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewProduct(product)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-600 border border-slate-200 transition cursor-pointer"
                              title="View Product Specifications"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditProduct({ ...product })}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition cursor-pointer"
                              title="Edit Product Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.id, product.title)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition cursor-pointer"
                              title="Delete from Catalog"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400">
                        No products match your current search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setViewProduct(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={viewProduct.thumbnail || (viewProduct.images && viewProduct.images[0])}
                  alt={viewProduct.title}
                  className="w-full h-72 object-cover rounded-2xl ring-2 ring-slate-100 bg-slate-50 shadow-md"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'; }}
                />
                {viewProduct.images && viewProduct.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {viewProduct.images.slice(0, 4).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50" />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold capitalize border border-violet-200">
                      {viewProduct.category?.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">SKU: {viewProduct.sku || `AUR-${viewProduct.id}`}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{viewProduct.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Brand: <span className="text-slate-800 font-medium">{viewProduct.brand || 'AURA'}</span></p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Retail Price</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatINR(viewProduct.price)}</p>
                  </div>
                  {viewProduct.discountPercentage > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Discount</p>
                      <p className="text-lg font-bold text-rose-600">-{Math.round(viewProduct.discountPercentage)}% OFF</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Inventory Status</span>
                    <span className={`font-semibold ${viewProduct.stock > 10 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {viewProduct.stock} units available
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${viewProduct.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (viewProduct.stock / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{viewProduct.description}</p>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditProduct({ ...viewProduct });
                      setViewProduct(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Specifications
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(viewProduct.id, viewProduct.title)}
                    className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditProduct(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Edit Product Details
            </h3>
            <p className="text-xs text-slate-500 mb-6">Modify price, stock count, and catalog description.</p>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editProduct.title}
                  onChange={e => setEditProduct({ ...editProduct, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={editProduct.stock}
                    onChange={e => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Category</label>
                <select
                  value={editProduct.category_id || ''}
                  onChange={e => setEditProduct({ ...editProduct, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 capitalize"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => {
                    const id = typeof c === 'object' ? c.id : c;
                    const name = typeof c === 'object' ? c.name : c;
                    return <option key={id} value={id}>{name}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editProduct.image || editProduct.thumbnail || ''}
                  onChange={e => setEditProduct({ ...editProduct, image: e.target.value, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-600" />
              Add Product to Catalog
            </h3>
            <p className="text-xs text-slate-500 mb-6">List a new item for sale across the AURA store.</p>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Zenith Minimalist Mechanical Keyboard"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="2999"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newProduct.category_id || ''}
                    onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500 capitalize"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => {
                      const id = typeof c === 'object' ? c.id : c;
                      const name = typeof c === 'object' ? c.name : c;
                      return <option key={id} value={id}>{name}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProduct.thumbnail}
                  onChange={e => setNewProduct({ ...newProduct, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Provide specifications and highlights..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition cursor-pointer"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
