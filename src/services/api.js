import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const userService = {
  async getUsers() {
    try {
      const res = await apiClient.get('/users');
      return res.data?.users || res.data?.data || [];
    } catch (e) {
      console.error('[Admin API] getUsers error:', e.message);
      return [];
    }
  },

  async createUser(userData) {
    try {
      const payload = {
        clerk_user_id: userData.clerk_user_id || `clerk_manual_${Date.now()}`,
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        phone: userData.phone,
      };
      const res = await apiClient.post('/users/sync', payload);
      return res.data?.user || res.data;
    } catch (e) {
      console.error('[Admin API] createUser error:', e.message);
      throw e;
    }
  },

  async updateUser(id, data) {
    try {
      const res = await apiClient.put(`/users/${id}`, data);
      return res.data?.user || res.data;
    } catch (e) {
      console.error('[Admin API] updateUser error:', e.message);
      throw e;
    }
  },

  async deleteUser(id) {
    try {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    } catch (e) {
      console.error('[Admin API] deleteUser error:', e.message);
      throw e;
    }
  },
};

export const orderService = {
  async getOrders() {
    try {
      const res = await apiClient.get('/orders');
      return res.data?.orders || res.data?.data || [];
    } catch (e) {
      console.error('[Admin API] getOrders error:', e.message);
      return [];
    }
  },

  async getOrderById(orderId) {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      return res.data?.order || res.data;
    } catch (e) {
      console.error('[Admin API] getOrderById error:', e.message);
      return null;
    }
  },

  async updateOrderStatus(orderId, newStatus, paymentStatus) {
    try {
      const res = await apiClient.put(`/orders/${orderId}/status`, {
        status: newStatus,
        payment_status: paymentStatus,
      });
      return res.data?.order || res.data;
    } catch (e) {
      console.error('[Admin API] updateOrderStatus error:', e.message);
      throw e;
    }
  },
};

const LOCAL_PRODUCTS_KEY = 'aura_admin_products';

export const categoryService = {
  async getCategories() {
    try {
      const r = await apiClient.get('/categories');
      return r.data?.data || r.data || [];
    } catch (e) {
      console.warn('[Admin API] getCategories error:', e.message);
      return [];
    }
  },

  async getCategoryById(id) {
    const r = await apiClient.get(`/category/${id}`);
    return r.data?.data || r.data;
  },

  async createCategory(categoryData) {
    const r = await apiClient.post('/category', categoryData);
    return r.data?.data || r.data;
  },

  async updateCategory(id, categoryData) {
    const r = await apiClient.put(`/category/${id}`, categoryData);
    return r.data?.data || r.data;
  },

  async deleteCategory(id) {
    const r = await apiClient.delete(`/category/${id}`);
    return r.data;
  }
};

export const productService = {
  async getProducts({ limit = 50, skip = 0, search } = {}) {
    try {
      const r = await apiClient.get('/product');
      const raw = r.data?.data || r.data || [];
      const list = (Array.isArray(raw) ? raw : []).map(p => ({
        ...p,
        id: p.id,
        title: p.name || p.title || 'Product',
        name: p.name || p.title || 'Product',
        price: Number(p.price || 0),
        stock: p.stock !== undefined ? Number(p.stock) : 0,
        category: p.category_name || p.category || 'General',
        category_name: p.category_name || p.category || 'General',
        category_id: p.category_id,
        thumbnail: p.image || p.thumbnail || '',
        image: p.image || '',
        description: p.description || '',
      }));
      return { products: list, total: list.length };
    } catch (e) {
      console.warn('[Admin API] products backend error:', e.message);
      return { products: [], total: 0 };
    }
  },

  async getProductById(id) {
    try {
      const r = await apiClient.get(`/product/${id}`);
      const raw = r.data?.data || r.data;
      if (raw) {
        return {
          ...raw,
          id: raw.id,
          title: raw.name || raw.title || 'Product',
          name: raw.name || raw.title || 'Product',
          price: Number(raw.price || 0),
          stock: raw.stock !== undefined ? Number(raw.stock) : 0,
          category: raw.category_name || raw.category || 'General',
          category_name: raw.category_name || raw.category || 'General',
          category_id: raw.category_id,
          thumbnail: raw.image || raw.thumbnail || '',
          image: raw.image || '',
          description: raw.description || '',
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async getCategories() {
    try {
      const r = await apiClient.get('/categories');
      const raw = r.data?.data || r.data || [];
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      console.warn('[Admin API] getCategories error:', e.message);
      return [];
    }
  },

  async saveLocalProduct(product) {
    const payload = {
      name: product.name || product.title,
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0,
      image: product.image || product.thumbnail || '',
      category_id: product.category_id,
    };
    
    if (product.id && typeof product.id === 'string' && product.id.length > 20) {
      const r = await apiClient.put(`/product/${product.id}`, payload);
      return r.data?.data || r.data;
    } else {
      const r = await apiClient.post('/product', payload);
      return r.data?.data || r.data;
    }
  },

  async deleteLocalProduct(id) {
    const r = await apiClient.delete(`/product/${id}`);
    return r.data;
  }
};

const INITIAL_COUPONS = [
  { code: 'AURA10', discount: 10, type: 'percentage', minSpend: 999, usageCount: 0, status: 'active', expiresAt: '2026-12-31' },
  { code: 'WELCOME20', discount: 20, type: 'percentage', minSpend: 1999, usageCount: 0, status: 'active', expiresAt: '2026-11-30' },
  { code: 'LUXE500', discount: 500, type: 'fixed', minSpend: 2500, usageCount: 0, status: 'active', expiresAt: '2026-10-31' },
];

export const couponService = {
  getCoupons() {
    try {
      const s = localStorage.getItem('aura_admin_coupons');
      if (s) return JSON.parse(s);
    } catch {}
    localStorage.setItem('aura_admin_coupons', JSON.stringify(INITIAL_COUPONS));
    return INITIAL_COUPONS;
  },
  saveCoupons(coupons) {
    try {
      localStorage.setItem('aura_admin_coupons', JSON.stringify(coupons));
    } catch {}
  },
  toggleCouponStatus(code) {
    apiClient.patch(`/admin/coupons/${code}/status`).catch(() => {});
    const list = this.getCoupons().map(c => c.code === code ? { ...c, status: c.status === 'active' ? 'expired' : 'active' } : c);
    this.saveCoupons(list);
    return list;
  },
  addCoupon(coupon) {
    apiClient.post('/admin/coupons', coupon).catch(() => {});
    const list = [coupon, ...this.getCoupons().filter(c => c.code !== coupon.code)];
    this.saveCoupons(list);
    return list;
  },
  deleteCoupon(code) {
    apiClient.delete(`/admin/coupons/${code}`).catch(() => {});
    const list = this.getCoupons().filter(c => c.code !== code);
    this.saveCoupons(list);
    return list;
  }
};
