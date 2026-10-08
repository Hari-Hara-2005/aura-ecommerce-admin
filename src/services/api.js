import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------- USERS MANAGEMENT ----------
const INITIAL_USERS = [
  { id: 'usr_2xA9kL', firstName: 'Alex', lastName: 'Morgan', email: 'alex.morgan@example.com', role: 'buyer', phone: '+1 555-234-8901', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80', createdAt: '2026-08-12T09:14:00Z', lastSignIn: '2026-10-07T18:22:00Z', ordersCount: 7, totalSpent: 2847.50, status: 'active', city: 'New Delhi', country: 'India' },
  { id: 'usr_3bR1mN', firstName: 'Jordan', lastName: 'Taylor', email: 'jordan.taylor@example.com', role: 'vip', phone: '+91 98765-43210', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', createdAt: '2026-06-01T11:30:00Z', lastSignIn: '2026-10-08T06:55:00Z', ordersCount: 18, totalSpent: 12430.00, status: 'active', city: 'Mumbai', country: 'India' },
  { id: 'usr_4cS2oP', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@example.com', role: 'buyer', phone: '+91 91234-56789', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80', createdAt: '2026-09-20T14:45:00Z', lastSignIn: '2026-10-06T22:10:00Z', ordersCount: 3, totalSpent: 649.99, status: 'active', city: 'Bangalore', country: 'India' },
  { id: 'usr_5dT3pQ', firstName: 'Marcus', lastName: 'Chen', email: 'marcus.chen@example.com', role: 'buyer', phone: '+1 415-890-2345', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80', createdAt: '2026-07-15T08:20:00Z', lastSignIn: '2026-10-05T15:35:00Z', ordersCount: 11, totalSpent: 5890.00, status: 'active', city: 'San Francisco', country: 'USA' },
  { id: 'usr_6eU4qR', firstName: 'Sofia', lastName: 'Dubois', email: 'sofia.dubois@example.com', role: 'vip', phone: '+33 6 12 34 56 78', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', createdAt: '2026-05-10T16:00:00Z', lastSignIn: '2026-10-08T08:12:00Z', ordersCount: 24, totalSpent: 18750.00, status: 'active', city: 'Paris', country: 'France' },
  { id: 'usr_7fV5rS', firstName: 'Ravi', lastName: 'Patel', email: 'ravi.patel@example.com', role: 'buyer', phone: '+91 99887-76655', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80', createdAt: '2026-10-01T10:00:00Z', lastSignIn: '2026-10-03T12:00:00Z', ordersCount: 1, totalSpent: 220.00, status: 'inactive', city: 'Ahmedabad', country: 'India' },
];

export const userService = {
  getUsers() {
    try {
      const stored = localStorage.getItem('aura_admin_users');
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem('aura_admin_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  },
  async fetchUsersFromBackend() {
    try {
      const res = await apiClient.get('/admin/users');
      if (Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem('aura_admin_users', JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      console.warn('[Admin API] fetchUsers fallback:', e.message);
    }
    return this.getUsers();
  },
  saveUsers(users) {
    try {
      localStorage.setItem('aura_admin_users', JSON.stringify(users));
    } catch {}
  },
  updateUserRole(userId, newRole) {
    apiClient.patch(`/admin/users/${userId}/role`, { role: newRole }).catch(() => {});
    const list = this.getUsers().map(u => u.id === userId ? { ...u, role: newRole } : u);
    this.saveUsers(list);
    return list;
  },
  toggleUserStatus(userId) {
    apiClient.patch(`/admin/users/${userId}/status`).catch(() => {});
    const list = this.getUsers().map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u);
    this.saveUsers(list);
    return list;
  },
  deleteUser(userId) {
    apiClient.delete(`/admin/users/${userId}`).catch(() => {});
    const list = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(list);
    return list;
  }
};

export const MOCK_USERS = INITIAL_USERS;

// ---------- ORDERS MANAGEMENT ----------
const INITIAL_ORDERS = [
  {
    id: 'ORD-M1K7RZ-4821', status: 'Confirmed', createdAt: '2026-10-07T14:32:00Z',
    customer: { firstName: 'Jordan', lastName: 'Taylor', email: 'jordan.taylor@example.com', clerkUserId: 'usr_3bR1mN', phone: '+91 98765-43210', address: '42 Marine Drive, Apt 9B', city: 'Mumbai', state: 'MH', zip: '400020', country: 'India' },
    items: [
      { id: 1, title: 'Chronos Luminary Obsidian Ceramic Watch', quantity: 1, price: 899.00, thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80' },
      { id: 2, title: 'Solstice Botanical Eau De Parfum 100ml', quantity: 2, price: 185.00, thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80' },
    ],
    pricing: { subtotal: 1269.00, discountAmount: 126.90, couponCode: 'LUXE10', shipping: 0, tax: 57.11, total: 1199.21 },
    payment: { gateway: 'Razorpay', paymentId: 'pay_test_abc123', orderId: 'order_test_987', status: 'PAID', paidAt: '2026-10-07T14:33:15Z' },
  },
  {
    id: 'ORD-N2L8SA-5932', status: 'Shipped', createdAt: '2026-10-05T09:18:00Z',
    customer: { firstName: 'Alex', lastName: 'Morgan', email: 'alex.morgan@example.com', clerkUserId: 'usr_2xA9kL', phone: '+1 555-234-8901', address: '12 Connaught Place, Block C', city: 'New Delhi', state: 'DL', zip: '110001', country: 'India' },
    items: [
      { id: 3, title: 'AURA CyberSphere Studio Wireless Headphones', quantity: 1, price: 349.99, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80' },
    ],
    pricing: { subtotal: 349.99, discountAmount: 0, couponCode: null, shipping: 0, tax: 17.50, total: 367.49 },
    payment: { gateway: 'Razorpay', paymentId: 'pay_test_def456', orderId: 'order_test_654', status: 'PAID', paidAt: '2026-10-05T09:19:02Z' },
  },
  {
    id: 'ORD-O3M9TB-6043', status: 'Delivered', createdAt: '2026-09-28T16:45:00Z',
    customer: { firstName: 'Sofia', lastName: 'Dubois', email: 'sofia.dubois@example.com', clerkUserId: 'usr_6eU4qR', phone: '+33 6 12 34 56 78', address: '18 Rue de Rivoli', city: 'Paris', state: 'IDF', zip: '75004', country: 'France' },
    items: [
      { id: 4, title: 'Elysian Full-Grain Italian Leather Weekender Bag', quantity: 1, price: 430.00, thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80' },
      { id: 5, title: 'Acrobat Swift Carbon Fiber Road Runner', quantity: 1, price: 220.00, thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' },
    ],
    pricing: { subtotal: 650.00, discountAmount: 65.00, couponCode: 'SAVE10', shipping: 0, tax: 29.25, total: 614.25 },
    payment: { gateway: 'Razorpay', paymentId: 'pay_test_ghi789', orderId: 'order_test_321', status: 'PAID', paidAt: '2026-09-28T16:46:20Z' },
  },
  {
    id: 'ORD-P4N0UC-7154', status: 'Processing', createdAt: '2026-10-08T07:02:00Z',
    customer: { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@example.com', clerkUserId: 'usr_4cS2oP', phone: '+91 91234-56789', address: '88 Indiranagar 100ft Road', city: 'Bangalore', state: 'KA', zip: '560038', country: 'India' },
    items: [
      { id: 6, title: 'Aether Mirage Mirrorless 4K Cinema Camera', quantity: 1, price: 1999.00, thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80' },
    ],
    pricing: { subtotal: 1999.00, discountAmount: 239.88, couponCode: 'FESTIVE12', shipping: 0, tax: 87.96, total: 1847.08 },
    payment: { gateway: 'Razorpay', paymentId: 'pay_test_jkl012', orderId: 'order_test_789', status: 'PAID', paidAt: '2026-10-08T07:03:00Z' },
  },
  {
    id: 'ORD-Q5O1VD-8265', status: 'Cancelled', createdAt: '2026-10-02T20:15:00Z',
    customer: { firstName: 'Ravi', lastName: 'Patel', email: 'ravi.patel@example.com', clerkUserId: 'usr_7fV5rS', phone: '+91 99887-76655', address: '14 SG Highway, Bodakdev', city: 'Ahmedabad', state: 'GJ', zip: '380054', country: 'India' },
    items: [
      { id: 7, title: 'Nova Acoustic High-Fidelity Desktop Speaker', quantity: 1, price: 380.00, thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=200&q=80' },
    ],
    pricing: { subtotal: 380.00, discountAmount: 0, couponCode: null, shipping: 15.00, tax: 19.75, total: 414.75 },
    payment: { gateway: 'Razorpay', paymentId: 'pay_test_mno345', orderId: 'order_test_901', status: 'REFUNDED', paidAt: '2026-10-02T20:16:11Z' },
  },
];

export const orderService = {
  getOrders() {
    try {
      const stored = localStorage.getItem('aura_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(o => o.id));
          const merged = [...parsed, ...INITIAL_ORDERS.filter(o => !existingIds.has(o.id))];
          return merged;
        }
      }
    } catch {}
    localStorage.setItem('aura_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  },
  async fetchOrdersFromBackend() {
    try {
      const res = await apiClient.get('/admin/orders');
      if (Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem('aura_orders', JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      console.warn('[Admin API] fetchOrders fallback:', e.message);
    }
    return this.getOrders();
  },
  saveOrders(orders) {
    try {
      localStorage.setItem('aura_orders', JSON.stringify(orders));
    } catch {}
  },
  updateOrderStatus(orderId, newStatus) {
    apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus }).catch(() => {});
    const list = this.getOrders().map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    this.saveOrders(list);
    return list;
  },
  getOrderById(orderId) {
    return this.getOrders().find(o => o.id === orderId) || null;
  }
};

export function getMockOrders() {
  return orderService.getOrders();
}

// ---------- PRODUCTS CRUD ----------
const LOCAL_PRODUCTS_KEY = 'aura_admin_products';

export const productService = {
  async getProducts({ limit = 50, skip = 0, search } = {}) {
    try {
      // 1. Fetch from our Express Neon Backend API first
      let url = `/products?limit=${limit}&skip=${skip}`;
      if (search && search.trim()) url += `&search=${encodeURIComponent(search)}`;
      const r = await apiClient.get(url);
      if (r.data && Array.isArray(r.data.products)) {
        return r.data;
      }
    } catch (e) {
      console.warn('[Admin API] products backend fallback to local:', e.message);
    }

    // 2. Local fallback
    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || '[]');
      return { products: local, total: local.length };
    } catch {
      return { products: [], total: 0 };
    }
  },

  async getProductById(id) {
    try {
      const r = await apiClient.get(`/products/${id}`);
      return r.data;
    } catch {
      const local = JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || '[]');
      return local.find(p => String(p.id) === String(id)) || null;
    }
  },

  async getCategories() {
    try {
      const r = await apiClient.get('/products/categories');
      if (Array.isArray(r.data)) return r.data;
    } catch {}
    return ['mens-watches', 'mobile-accessories', 'fragrances', 'womens-bags', 'mens-shoes', 'smartphones', 'electronics'];
  },

  async saveLocalProduct(product) {
    try {
      if (product.id && !String(product.id).startsWith('temp_')) {
        await apiClient.put(`/admin/products/${product.id}`, product);
      } else {
        await apiClient.post('/admin/products', product);
      }
    } catch (e) {
      console.warn('[Admin API] save product local fallback:', e.message);
    }

    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || '[]');
      const idx = local.findIndex(p => String(p.id) === String(product.id));
      if (idx >= 0) local[idx] = product;
      else local.unshift(product);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(local));
    } catch {}
  },

  async deleteLocalProduct(id) {
    try {
      await apiClient.delete(`/admin/products/${id}`);
    } catch (e) {
      console.warn('[Admin API] delete product local fallback:', e.message);
    }

    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || '[]');
      const updated = local.filter(p => String(p.id) !== String(id));
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
    } catch {}
  }
};

// ---------- COUPONS MANAGEMENT ----------
const INITIAL_COUPONS = [
  { code: 'AURA10', discount: 10, type: 'percentage', minSpend: 50, usageCount: 142, status: 'active', expiresAt: '2026-12-31' },
  { code: 'LUXE20', discount: 20, type: 'percentage', minSpend: 200, usageCount: 68, status: 'active', expiresAt: '2026-11-30' },
  { code: 'FIRST50', discount: 50, type: 'fixed', minSpend: 150, usageCount: 95, status: 'active', expiresAt: '2026-10-31' },
  { code: 'FLASH30', discount: 30, type: 'percentage', minSpend: 100, usageCount: 310, status: 'expired', expiresAt: '2026-09-30' },
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
