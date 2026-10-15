import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, RefreshCw, AlertTriangle, PackageX,
  ShoppingBag, UserPlus, X, Check, Clock, Sparkles, Trash2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'order' | 'inventory' | 'customer'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    countsByType,
    loading,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotifications();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter out any temporary test alerts and apply active tab
  const filteredNotifications = notifications
    .filter((n) => !n.id?.startsWith('test_'))
    .filter((n) => {
      if (activeTab === 'all') return true;
      return n.type === activeTab;
    });

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const getCategoryConfig = (n) => {
    if (n.type === 'inventory') {
      if (n.subType === 'out_of_stock') {
        return {
          icon: PackageX,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50 border-rose-200',
          badgeText: 'OUT OF STOCK',
          badgeStyle: 'bg-rose-100 text-rose-700 border-rose-200',
          borderAccent: 'border-l-rose-500',
        };
      }
      return {
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 border-amber-200',
        badgeText: 'LOW STOCK',
        badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200',
        borderAccent: 'border-l-amber-500',
      };
    }
    if (n.type === 'order') {
      return {
        icon: ShoppingBag,
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-50 border-indigo-200',
        badgeText: 'NEW ORDER',
        badgeStyle: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        borderAccent: 'border-l-indigo-500',
      };
    }
    // customer
    return {
      icon: UserPlus,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'NEW CUSTOMER',
      badgeStyle: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      borderAccent: 'border-l-emerald-500',
    };
  };

  const realActiveNotifications = notifications.filter((n) => !n.id?.startsWith('test_'));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
          isOpen
            ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm'
            : 'bg-slate-100 hover:bg-slate-200/70 border-slate-200 text-slate-700'
        }`}
        aria-label="Store Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
      >
        <Bell className={`w-4 h-4 transition ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-600'}`} />

        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 animate-ping opacity-30 pointer-events-none"></span>
          </>
        )}
      </button>

      {/* Floating Notification Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 sm:w-[440px] max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[85vh]">
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Notifications</h3>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                        {unreadCount} unread
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Up to date
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Store alerts & activity</p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => refresh()}
                  className={`p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer ${
                    loading ? 'animate-spin text-violet-600' : ''
                  }`}
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg border border-transparent hover:border-violet-200 transition cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/70 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                All ({countsByType.all})
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-800 border border-slate-200/80'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 inline" />
                Low Stock ({countsByType.inventory})
              </button>

              <button
                onClick={() => setActiveTab('order')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'order'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200/80'
                }`}
              >
                <ShoppingBag className="w-3 h-3 text-indigo-500 inline" />
                Orders ({countsByType.order})
              </button>

              <button
                onClick={() => setActiveTab('customer')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'customer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80'
                }`}
              >
                <UserPlus className="w-3 h-3 text-emerald-500 inline" />
                Customers ({countsByType.customer})
              </button>
            </div>
          </div>

          {/* Notifications Scrollable Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[440px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">No notifications</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
                  {activeTab === 'all'
                    ? "Your catalog, orders, and customer activities are all quiet and in balance."
                    : `No ${activeTab} notifications to display.`}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const config = getCategoryConfig(n);
                const IconComponent = config.icon;

                return (
                  <div
                    key={n.id}
                    className={`relative p-4 transition flex gap-3 group border-l-4 ${config.borderAccent} ${
                      n.isRead ? 'bg-white hover:bg-slate-50/80 opacity-75' : 'bg-slate-50/50 hover:bg-violet-50/30'
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      onClick={() => handleNotificationClick(n)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer ${config.iconBg}`}
                    >
                      <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(n)}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wide border ${config.badgeStyle}`}>
                            {config.badgeText}
                          </span>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" title="Unread" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {n.timeAgo || 'Just now'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-violet-700 transition line-clamp-1 cursor-pointer">
                        {n.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed cursor-pointer">
                        {n.message}
                      </p>
                    </div>

                    {/* Hover Quick Actions */}
                    <div className="flex flex-col items-center justify-between py-0.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(n.id);
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (n.isRead) {
                            markAsUnread(n.id);
                          } else {
                            markAsRead(n.id);
                          }
                        }}
                        className={`p-1 rounded-lg transition cursor-pointer ${
                          n.isRead
                            ? 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                            : 'text-violet-600 hover:bg-violet-100'
                        }`}
                        title={n.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean Footer Bar */}
          {realActiveNotifications.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {realActiveNotifications.length} notification{realActiveNotifications.length > 1 ? 's' : ''}
              </span>

              <button
                onClick={() => clearAll()}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
