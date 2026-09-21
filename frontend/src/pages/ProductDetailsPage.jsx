import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { reviewApi } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useChat } from '../context/ChatContext';
import { formatCurrency, formatDate, getConditionDetails } from '../utils/formatters';
import OrderModal from '../components/order/OrderModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Heart,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Store,
  Tag,
  Share2,
  CheckCircle2,
  MessageCircle,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { openChat } = useChat();

  const [product, setProduct] = useState(null);
  const [sellerRating, setSellerRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    productApi.getById(id)
      .then((res) => {
        if (res?.data) {
          setProduct(res.data);
          if (res.data.sellerId) {
            reviewApi.getSellerReviews(res.data.sellerId)
              .then((ratingRes) => setSellerRating(ratingRes?.data))
              .catch((err) => console.warn('Could not load seller reviews', err));
          }
        }
      })
      .catch((err) => {
        toast.error('Item not found or unavailable');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <LoadingSpinner message="Loading item details..." />;
  if (!product) return null;

  const conditionInfo = getConditionDetails(product.itemCondition);
  const wishlisted = isWishlisted(product.id);
  const isOwner = user?.id === product.sellerId;

  const handlePlaceOrder = async (orderData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }
    try {
      await orderApi.create(orderData);
      toast.success('Your offer has been submitted to the seller!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.message || 'Could not place order');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Back */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
        <button
          onClick={handleShare}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Images */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${conditionInfo.badgeClass}`}>
                {conditionInfo.label}
              </span>
            </div>
            {(product.status === 'RESERVED' || product.status === 'PENDING_SALE') && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <span className="px-6 py-2 bg-amber-500 text-white font-extrabold text-xl uppercase tracking-widest rounded-2xl shadow-xl">
                  RESERVED
                </span>
              </div>
            )}
            {product.status === 'SOLD' && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
                <span className="px-6 py-2 bg-rose-600 text-white font-extrabold text-xl uppercase tracking-widest rounded-2xl shadow-xl">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Details & Order CTA */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Category & Date */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Listed {formatDate(product.createdAt)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {product.discountPercentage}% OFF RETAIL
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Price is negotiable via direct offer.
              </p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Available in <strong>{product.location}</strong></span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Seller's Description & Condition Notes
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                {product.description}
              </p>
            </div>

            {/* Seller Profile Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {product.sellerName ? product.sellerName[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">{product.sellerName}</h4>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-400">{product.sellerCity || 'Verified Marketplace Member'}</p>
                  {sellerRating && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-slate-700">
                        {sellerRating.totalReviews > 0
                          ? `${sellerRating.averageRating.toFixed(1)} (${sellerRating.totalReviews} ${sellerRating.totalReviews === 1 ? 'review' : 'reviews'})`
                          : 'New Seller (0 reviews)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Seller
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex items-center gap-3">
            {isOwner ? (
              <Link
                to="/seller"
                className="flex-1 py-3 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow transition"
              >
                Manage in Seller Hub
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  disabled={product.status === 'SOLD' || product.status === 'RESERVED' || product.status === 'PENDING_SALE'}
                  className={`flex-1 py-3.5 font-bold text-sm rounded-2xl shadow-lg transition ${
                    product.status === 'SOLD'
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                      : product.status === 'RESERVED' || product.status === 'PENDING_SALE'
                      ? 'bg-amber-500 text-white cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow'
                  }`}
                >
                  {product.status === 'SOLD'
                    ? 'Item Already Sold'
                    : product.status === 'RESERVED' || product.status === 'PENDING_SALE'
                    ? 'Item Reserved by Another Buyer'
                    : 'Make Offer / Place Order'}
                </button>

                <button
                  onClick={() => openChat(null, product.id)}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center gap-2"
                  title="Chat with Seller"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition ${
                    wishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Verified Seller Reviews Section */}
      {sellerRating && sellerRating.recentReviews && sellerRating.recentReviews.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Verified Customer Reviews for {sellerRating.sellerName}</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  ★ {sellerRating.averageRating.toFixed(1)} / 5.0
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Based on {sellerRating.totalReviews} completed marketplace transaction{sellerRating.totalReviews === 1 ? '' : 's'}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellerRating.recentReviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.comment}"</p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Verified Buyer: <strong>{rev.buyerName}</strong></span>
                  <span className="truncate max-w-[50%] text-slate-400 font-medium">on {rev.productTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
        onSubmit={handlePlaceOrder}
      />
    </div>
  );
}