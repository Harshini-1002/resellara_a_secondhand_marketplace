import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { categoryApi } from '../api/categoryApi';
import { reviewApi } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getOrderStatusDetails, getConditionDetails } from '../utils/formatters';
import ProductFormModal from '../components/product/ProductFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'orders' | 'reviews'
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listingsRes, ordersRes, categoriesRes, ratingRes] = await Promise.all([
        productApi.getMyListings(),
        orderApi.getSellerOrders(),
        categoryApi.getAll(),
        user?.id ? reviewApi.getSellerReviews(user.id).catch(() => null) : Promise.resolve(null),
      ]);
      setListings(listingsRes?.data || []);
      setOrders(ordersRes?.data || []);
      setCategories(categoriesRes?.data || []);
      if (ratingRes?.data) setRatingSummary(ratingRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Failed to load seller dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create or Update Listing
  const handleSaveListing = async (formData) => {
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
        toast.success('Listing updated successfully!');
      } else {
        await productApi.create(formData);
        toast.success('Listing published to marketplace!');
      }
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save listing');
      throw err;
    }
  };

  // Delete Listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      await productApi.delete(id);
      toast.success('Listing deleted');
      setListings(listings.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
    }
  };

  // Toggle Sold / Available Status
  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    try {
      await productApi.updateStatus(item.id, nextStatus);
      toast.success(`Item marked as ${nextStatus.toLowerCase()}`);
      setListings(
        listings.map((p) => (p.id === item.id ? { ...p, status: nextStatus } : p))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update item status');
    }
  };

  // Accept, Decline, Complete or Cancel Order
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await orderApi.updateStatus(orderId, status);
      if (status === 'ACCEPTED') {
        toast.success('Offer accepted! Item reserved for buyer.');
      } else if (status === 'COMPLETED') {
        toast.success('Deal marked as completed & item marked as sold!');
      } else if (status === 'REJECTED') {
        toast.success('Order declined / cancelled. Item restored to available.');
      } else {
        toast.success(`Order status updated to ${status.toLowerCase()}`);
      }
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const activeListingsCount = listings.filter((p) => p.status === 'AVAILABLE').length;
  const soldListingsCount = listings.filter((p) => p.status === 'SOLD').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  if (loading) return <LoadingSpinner message="Loading seller dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Seller Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your used-item inventory, review buyer offers, and track your sales.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Item</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Listings</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{listings.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Listings</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{activeListingsCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Sold</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{soldListingsCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Offers</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{pendingOrdersCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Seller Rating</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-black text-slate-900">
              {ratingSummary && ratingSummary.totalReviews > 0
                ? `${ratingSummary.averageRating.toFixed(1)}`
                : 'New'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({ratingSummary?.totalReviews || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Listings ({listings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 relative ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Incoming Offers & Orders ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
              {pendingOrdersCount} new
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Customer Reviews ({ratingSummary?.totalReviews || 0})</span>
        </button>
      </div>

      {/* Tab 1: Listings Content */}
      {activeTab === 'listings' && (
        <div>
          {listings.length === 0 ? (
            <EmptyState
              title="You don't have any listings yet"
              description="Post your pre-owned electronics, furniture, or vehicles to start getting offers from verified buyers."
              actionText="Create Your First Listing"
              onAction={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => {
                const conditionInfo = getConditionDetails(item.itemCondition);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/9] bg-slate-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm ${conditionInfo.badgeClass}`}>
                            {conditionInfo.label}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xl font-black text-slate-900">
                            {formatCurrency(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                          <span>{item.location}</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition"
                      >
                        {item.status === 'AVAILABLE' ? 'Mark Sold' : 'Mark Available'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              title="No buyer offers yet"
              description="When buyers place an offer or buy one of your listed items, their details and offers will appear here for you to accept or decline."
            />
          ) : (
            orders.map((order) => {
              const statusInfo = getOrderStatusDetails(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Product & Buyer Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={order.productImageUrl}
                      alt={order.productTitle}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-slate-400">Order #{order.id} • {formatDate(order.createdAt)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{order.productTitle}</h4>

                      {/* Buyer Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Buyer: <strong>{order.buyerName}</strong> ({order.buyerEmail})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phone: <strong>{order.contactPhone}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">Address: <strong>{order.deliveryAddress}</strong></span>
                        </div>
                      </div>

                      {order.notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                          "{order.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Pricing & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-4 w-full md:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Buyer's Offer</span>
                      <span className="text-2xl font-black text-slate-900">
                        {formatCurrency(order.offerPrice)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Listed: {formatCurrency(order.productListedPrice)}
                      </span>
                    </div>

                    {order.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'ACCEPTED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept Offer</span>
                        </button>
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'REJECTED')}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'COMPLETED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Complete Deal & Mark Sold</span>
                        </button>
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'REJECTED')}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Deal</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Customer Reviews Content */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {!ratingSummary || ratingSummary.recentReviews.length === 0 ? (
            <EmptyState
              title="No customer reviews yet"
              description="Complete marketplace deals with buyers to earn verified ratings and customer feedback."
            />
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <span>Verified Seller Score:</span>
                    <span className="text-emerald-700 font-black text-lg">
                      ★ {ratingSummary.averageRating.toFixed(1)} / 5.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Accumulated across {ratingSummary.totalReviews} verified purchase{ratingSummary.totalReviews === 1 ? '' : 's'}.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-6 h-6 ${
                        s <= Math.round(ratingSummary.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ratingSummary.recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1.5">
                          {rev.rating}.0
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>

                    {rev.comment && (
                      <p className="text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        "{rev.comment}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        Verified Buyer: <strong>{rev.buyerName}</strong>
                      </span>
                      <span className="truncate max-w-[50%] text-slate-400 font-medium">
                        {rev.productTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Create / Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveListing}
        initialData={editingProduct}
        categories={categories}
      />
    </div>
  );
}