import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, RefreshCw, AlertTriangle, PackageX,
  ShoppingBag, UserPlus, X, Check, Clock, Sparkles, Trash2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
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
          iconColor: 'text-black',
          iconBg: 'bg-neutral-100 border-neutral-300',
          badgeText: 'OUT OF STOCK',
          badgeStyle: 'bg-black text-white border-black',
          borderAccent: 'border-l-black',
        };
      }
      return {
        icon: AlertTriangle,
        iconColor: 'text-neutral-800',
        iconBg: 'bg-neutral-100 border-neutral-300',
        badgeText: 'LOW STOCK',
        badgeStyle: 'bg-neutral-200 text-neutral-900 border-neutral-300',
        borderAccent: 'border-l-neutral-600',
      };
    }
    if (n.type === 'order') {
      return {
        icon: ShoppingBag,
        iconColor: 'text-black',
        iconBg: 'bg-neutral-100 border-neutral-300',
        badgeText: 'NEW ORDER',
        badgeStyle: 'bg-neutral-900 text-white border-black',
        borderAccent: 'border-l-black',
      };
    }
    return {
      icon: UserPlus,
      iconColor: 'text-black',
      iconBg: 'bg-neutral-100 border-neutral-300',
      badgeText: 'NEW CUSTOMER',
      badgeStyle: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      borderAccent: 'border-l-neutral-400',
    };
  };

  const realActiveNotifications = notifications.filter((n) => !n.id?.startsWith('test_'));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-center focus:outline-none ${
          isOpen
            ? 'bg-black border-black text-white'
            : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-800'
        }`}
        aria-label="Store Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
      >
        <Bell className="w-4 h-4 transition" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 flex items-center justify-center rounded-full bg-black text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 sm:w-[440px] max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-xl border border-neutral-200 z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-neutral-900 text-sm tracking-tight">Notifications</h3>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-black text-white">
                        {unreadCount} unread
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Up to date
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Store alerts & activity</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => refresh()}
                  className={`p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200/60 rounded border border-transparent transition cursor-pointer ${
                    loading ? 'animate-spin text-black' : ''
                  }`}
                  title="Refresh notifications"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-900 hover:bg-neutral-200 rounded border border-neutral-300 transition cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-200 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                All ({countsByType.all})
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3 inline" />
                Low Stock ({countsByType.inventory})
              </button>

              <button
                onClick={() => setActiveTab('order')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'order'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <ShoppingBag className="w-3 h-3 inline" />
                Orders ({countsByType.order})
              </button>

              <button
                onClick={() => setActiveTab('customer')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'customer'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <UserPlus className="w-3 h-3 inline" />
                Customers ({countsByType.customer})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 max-h-[440px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-800">No notifications</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-[260px] mx-auto">
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
                      n.isRead ? 'bg-white hover:bg-neutral-50 opacity-75' : 'bg-neutral-50 hover:bg-neutral-100/80'
                    }`}
                  >
                    <div
                      onClick={() => handleNotificationClick(n)}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer ${config.iconBg}`}
                    >
                      <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(n)}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide border ${config.badgeStyle}`}>
                            {config.badgeText}
                          </span>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" title="Unread" />
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {n.timeAgo || 'Just now'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-neutral-900 hover:underline transition line-clamp-1 cursor-pointer">
                        {n.title}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed cursor-pointer">
                        {n.message}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-between py-0.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(n.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded transition cursor-pointer"
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
                        className={`p-1 rounded transition cursor-pointer ${
                          n.isRead
                            ? 'text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100'
                            : 'text-black hover:bg-neutral-200 font-bold'
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

          {realActiveNotifications.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-500 font-medium">
                {realActiveNotifications.length} notification{realActiveNotifications.length > 1 ? 's' : ''}
              </span>

              <button
                onClick={() => clearAll()}
                className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black transition cursor-pointer"
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
