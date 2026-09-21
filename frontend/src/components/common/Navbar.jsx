import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useChat } from '../../context/ChatContext';
import {
  ShoppingBag,
  Heart,
  Package,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Search,
  Store,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';

export default function Navbar({ searchQuery, setSearchQuery, onSearchSubmit }) {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { openChat, unreadCount } = useChat();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    } else {
      navigate(`/?q=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                Resell<span className="text-emerald-600">ara</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mt-0.5">
                Pre-Owned Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search phones, laptops, bikes, furniture..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full outline-none transition shadow-inner"
              />
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-0 sm:right-auto sm:relative bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {/* Chat Messages */}
                <button
                  onClick={() => openChat()}
                  className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition flex items-center gap-1.5"
                  title="Messages"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Chat</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:top-0 sm:right-auto sm:relative bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* My Orders */}
                <Link
                  to="/orders"
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition flex items-center gap-1.5"
                  title="My Orders"
                >
                  <Package className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Orders</span>
                </Link>

                {/* Seller Hub CTA */}
                {isSeller ? (
                  <Link
                    to="/seller"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Seller Hub</span>
                  </Link>
                ) : (
                  <Link
                    to="/register?role=ROLE_SELLER"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Sell on Resellara</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-left text-sm transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <p className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                        {user.fullName}
                      </p>
                      <p className="text-slate-400 capitalize">
                        {isSeller ? 'Seller' : 'Buyer'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          {isSeller ? 'Verified Seller' : 'Registered Buyer'}
                        </span>
                      </div>

                      {isSeller && (
                        <Link
                          to="/seller"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>Seller Dashboard</span>
                        </Link>
                      )}

                      <button
                        onClick={() => openChat()}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>Messages</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Saved Wishlist</span>
                      </Link>

                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}