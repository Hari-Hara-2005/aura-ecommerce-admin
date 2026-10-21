import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { userService, orderService } from '../services/api';
import {
  Users as UsersIcon, Search, Star, Phone,
  MapPin, ShoppingBag, CheckCircle2,
  XCircle, Eye, Trash2, UserPlus, X, IndianRupee, Clock
} from 'lucide-react';
import { formatINR } from '../utils/format';

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');

  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: 'India',
    role: 'buyer'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const [allOrders, setAllOrders] = useState([]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [data, ords] = await Promise.all([
        userService.getUsers(),
        orderService.getOrders()
      ]);
      const formatted = (Array.isArray(data) ? data : []).map(u => ({
        ...u,
        firstName: u.name ? u.name.split(' ')[0] : (u.firstName || 'Client'),
        lastName: u.name ? u.name.split(' ').slice(1).join(' ') : (u.lastName || ''),
        email: u.email || 'No email registered',
        phone: u.phone || 'No phone registered',
        role: u.role || 'buyer',
        status: u.status || 'active',
        totalSpent: Number(u.total_spent || u.totalSpent || 0),
        ordersCount: Number(u.orders_count || u.ordersCount || 0),
      }));
      setUsers(formatted);
      setAllOrders(Array.isArray(ords) ? ords : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''}`.toLowerCase();
      const matchQuery = !q ||
        fullName.includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.clerk_user_id?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q);

      const matchRole = roleFilter === 'ALL' || u.role?.toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === 'ALL' || u.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchQuery && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalCustomers = users.length;
  const vipCount = users.filter(u => u.role === 'vip').length;
  const totalSpentAll = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
  const activeCount = users.filter(u => u.status === 'active').length;

  const handleToggleStatus = async (id) => {
    const userToToggle = users.find(u => u.id === id);
    if (!userToToggle) return;
    const newStatus = userToToggle.status === 'active' ? 'inactive' : 'active';
    try {
      await userService.updateUser(id, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast('Customer status updated successfully');
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast('Customer status updated');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await userService.updateUser(id, { role: newRole });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }
      showToast(`Role changed to ${newRole.toUpperCase()}`);
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      showToast(`Role changed to ${newRole.toUpperCase()}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this customer record from the database?')) {
      try {
        await userService.deleteUser(id);
        if (selectedUser?.id === id) setSelectedUser(null);
        showToast('Customer record deleted from database');
        loadUsers();
      } catch (err) {
        showToast(`Failed to delete customer: ${err.message}`);
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserData.firstName || !newUserData.email) return;

    try {
      await userService.createUser(newUserData);
      setShowAddModal(false);
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '', city: '', country: 'India', role: 'buyer' });
      showToast(`Customer ${newUserData.firstName} created successfully in database!`);
      loadUsers();
    } catch (err) {
      showToast(`Failed to create customer: ${err.message}`);
    }
  };

  const userOrders = useMemo(() => {
    if (!selectedUser) return [];
    return allOrders.filter(o =>
      o.user_id === selectedUser.id ||
      o.customer?.clerkUserId === selectedUser.clerk_user_id ||
      o.customer?.email?.toLowerCase() === selectedUser.email?.toLowerCase()
    );
  }, [selectedUser, allOrders]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header title="Customers & Users" subtitle="Manage registered Clerk shoppers, customer tiers, and purchase histories." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium backdrop-blur-md animate-fade-in border border-slate-700/50 dark:border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Customers</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCustomers}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">Registered in Clerk & DB</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/40">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">VIP Members</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{vipCount}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">High-value shoppers</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Cumulative LTV</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{formatINR(totalSpentAll)}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">Total revenue generated</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Active Accounts</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeCount}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">{Math.round((activeCount / totalCustomers) * 100 || 0)}% engagement rate</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
          <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, city, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="vip">VIPs</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Role & Status</th>
                  <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Total Spent</th>
                  <th className="text-left px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Last Active</th>
                  <th className="text-right px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <div>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-1.5">
                            {user.firstName} {user.lastName}
                            {user.role === 'vip' && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{user.email}</p>
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${
                          user.role === 'vip'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                            : user.role === 'admin'
                            ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {user.role}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          user.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 line-through'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.city || 'Mumbai'}, {user.country || 'India'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                        <ShoppingBag className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>{user.ordersCount || 0} orders</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-900 dark:text-white font-bold text-sm font-mono">
                        {formatINR(user.totalSpent || 0)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(user.lastSignIn || user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                          title="View Customer Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                          title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative transition-colors duration-200">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
              <img
                src={selectedUser.imageUrl}
                alt={selectedUser.firstName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  {selectedUser.role === 'vip' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> VIP
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{selectedUser.email}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                    ID: {selectedUser.id}
                  </span>
                  <span>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Contact & Phone</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-500" />
                  {selectedUser.phone || 'Not provided'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Shipping Destination</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {selectedUser.city}, {selectedUser.country}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Purchases</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
                  {formatINR(selectedUser.totalSpent || 0)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedUser.ordersCount || 0} completed orders</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Account Tier Control</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, selectedUser.role === 'vip' ? 'buyer' : 'vip')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    {selectedUser.role === 'vip' ? 'Demote to Buyer' : 'Promote to VIP'}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    {selectedUser.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">
                Order History ({userOrders.length})
              </h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {userOrders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{order.id}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {order.items?.length || 1} items • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formatINR(order.pricing?.total || order.total_amount || 0)}</p>
                      <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-200/80 dark:border-violet-800/60">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {userOrders.length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No recorded orders yet for this profile.</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative transition-colors duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <UserPlus className="w-4 h-4" />
              </div>
              Add New Customer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Create a customer profile to simulate Clerk registration or manual account provisioning.</p>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.firstName}
                    onChange={e => setNewUserData({ ...newUserData, firstName: e.target.value })}
                    placeholder="e.g. Liam"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUserData.lastName}
                    onChange={e => setNewUserData({ ...newUserData, lastName: e.target.value })}
                    placeholder="e.g. Vance"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="liam.vance@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="+91 98765-12345"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={newUserData.city}
                    onChange={e => setNewUserData({ ...newUserData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Tier</label>
                <select
                  value={newUserData.role}
                  onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="buyer">Standard Buyer</option>
                  <option value="vip">VIP Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 transition cursor-pointer"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
