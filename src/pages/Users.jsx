import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { userService, orderService } from '../services/api';
import {
  Users as UsersIcon, Search, Filter, Star, Shield, Mail, Phone,
  MapPin, ShoppingBag, Calendar, MoreVertical, CheckCircle2,
  XCircle, Eye, Trash2, UserPlus, X, Sparkles, DollarSign, Clock
} from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState(() => userService.getUsers());
  const [search, setSearch] = useState('');
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

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchQuery = !q ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q);

      const matchRole = roleFilter === 'ALL' || u.role?.toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === 'ALL' || u.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchQuery && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalCustomers = users.length;
  const vipCount = users.filter(u => u.role === 'vip').length;
  const totalSpentAll = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
  const activeCount = users.filter(u => u.status === 'active').length;

  const handleToggleStatus = (id) => {
    const updated = userService.toggleUserStatus(id);
    setUsers(updated);
    if (selectedUser?.id === id) {
      setSelectedUser(updated.find(u => u.id === id));
    }
    showToast('Customer status updated successfully');
  };

  const handleRoleChange = (id, newRole) => {
    const updated = userService.updateUserRole(id, newRole);
    setUsers(updated);
    if (selectedUser?.id === id) {
      setSelectedUser(updated.find(u => u.id === id));
    }
    showToast(`Role changed to ${newRole.toUpperCase()}`);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to remove this customer record?')) {
      const updated = userService.deleteUser(id);
      setUsers(updated);
      if (selectedUser?.id === id) setSelectedUser(null);
      showToast('Customer record deleted');
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserData.firstName || !newUserData.email) return;

    const newUser = {
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      firstName: newUserData.firstName,
      lastName: newUserData.lastName,
      email: newUserData.email,
      phone: newUserData.phone || '+1 555-0100',
      imageUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50000)}?auto=format&fit=crop&w=128&q=80`,
      createdAt: new Date().toISOString(),
      lastSignIn: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
      status: 'active',
      city: newUserData.city || 'Mumbai',
      country: newUserData.country || 'India',
      role: newUserData.role || 'buyer'
    };

    const nextList = [newUser, ...users];
    userService.saveUsers(nextList);
    setUsers(nextList);
    setShowAddModal(false);
    setNewUserData({ firstName: '', lastName: '', email: '', phone: '', city: '', country: 'India', role: 'buyer' });
    showToast(`Customer ${newUser.firstName} created successfully!`);
  };

  const userOrders = useMemo(() => {
    if (!selectedUser) return [];
    const allOrders = orderService.getOrders();
    return allOrders.filter(o =>
      o.customer?.clerkUserId === selectedUser.id ||
      o.customer?.email?.toLowerCase() === selectedUser.email?.toLowerCase()
    );
  }, [selectedUser]);

  return (
    <div className="min-h-screen">
      <Header title="Customers & Users" subtitle="Manage registered Clerk shoppers, customer tiers, and purchase histories." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-emerald-400/30 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Customers</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalCustomers}</h3>
                <span className="text-xs text-emerald-400 mt-1 inline-block">Registered in Clerk & DB</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">VIP Members</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">{vipCount}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">High-value shoppers</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Cumulative LTV</p>
                <h3 className="text-2xl font-bold text-white mt-1">${totalSpentAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">Total revenue generated</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Active Accounts</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</h3>
                <span className="text-xs text-slate-400 mt-1 inline-block">{Math.round((activeCount / totalCustomers) * 100 || 0)}% engagement rate</span>
              </div>
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, city, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="ALL">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="vip">VIPs</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-900/40">
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Role & Status</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Total Spent</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Last Active</th>
                  <th className="text-right px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700/40"
                        />
                        <div>
                          <p className="text-white font-medium text-sm flex items-center gap-1.5">
                            {user.firstName} {user.lastName}
                            {user.role === 'vip' && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            )}
                          </p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                          <span className="font-mono text-[10px] text-slate-600 block mt-0.5">{user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
                          user.role === 'vip'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : user.role === 'admin'
                            ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700/50'
                        }`}>
                          {user.role}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {user.status}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300 text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.city || 'Mumbai'}, {user.country || 'India'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                        <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />
                        <span>{user.ordersCount || 0} orders</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-white font-semibold text-sm">
                        ${(user.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(user.lastSignIn || user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg bg-slate-800/60 hover:bg-violet-600/20 text-slate-400 hover:text-violet-400 border border-slate-700/40 transition"
                          title="View Customer Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg border transition ${
                            user.status === 'active'
                              ? 'bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700/40'
                              : 'bg-slate-800/60 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border-slate-700/40'
                          }`}
                          title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/40 transition"
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
                    <td colSpan={7} className="text-center py-12 text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800/60">
              <img
                src={selectedUser.imageUrl}
                alt={selectedUser.firstName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-violet-500/20 shadow-xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  {selectedUser.role === 'vip' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                      <Star className="w-3.5 h-3.5" /> VIP
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{selectedUser.email}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="font-mono bg-slate-800/70 px-2 py-0.5 rounded text-violet-400 border border-slate-700/50">
                    ID: {selectedUser.id}
                  </span>
                  <span>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/60">
                <p className="text-xs text-slate-500 uppercase font-semibold">Contact & Phone</p>
                <p className="text-sm font-medium text-slate-200 mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-400" />
                  {selectedUser.phone || 'Not provided'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/60">
                <p className="text-xs text-slate-500 uppercase font-semibold">Shipping Destination</p>
                <p className="text-sm font-medium text-slate-200 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  {selectedUser.city}, {selectedUser.country}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/60">
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Purchases</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  ${(selectedUser.totalSpent || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedUser.ordersCount || 0} completed orders</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/60">
                <p className="text-xs text-slate-500 uppercase font-semibold">Account Tier Control</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, selectedUser.role === 'vip' ? 'buyer' : 'vip')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      selectedUser.role === 'vip'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {selectedUser.role === 'vip' ? 'Demote to Buyer' : 'Promote to VIP'}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      selectedUser.status === 'active'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                Order History ({userOrders.length})
              </h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {userOrders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-violet-400">{order.id}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.items?.length || 1} items • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${order.pricing?.total?.toFixed(2) || '0.00'}</p>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {userOrders.length === 0 && (
                  <p className="text-xs text-slate-500 py-3 text-center">No recorded orders yet for this profile.</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-violet-400" />
              Add New Customer
            </h3>
            <p className="text-xs text-slate-400 mb-6">Create a customer profile to simulate Clerk registration or manual account provisioning.</p>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.firstName}
                    onChange={e => setNewUserData({ ...newUserData, firstName: e.target.value })}
                    placeholder="e.g. Liam"
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUserData.lastName}
                    onChange={e => setNewUserData({ ...newUserData, lastName: e.target.value })}
                    placeholder="e.g. Vance"
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="liam.vance@example.com"
                  className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="+91 98765-12345"
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={newUserData.city}
                    onChange={e => setNewUserData({ ...newUserData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role / Tier</label>
                <select
                  value={newUserData.role}
                  onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="buyer">Standard Buyer</option>
                  <option value="vip">VIP Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition cursor-pointer"
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
