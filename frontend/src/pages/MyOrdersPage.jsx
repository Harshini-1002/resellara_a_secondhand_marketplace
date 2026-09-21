import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { reviewApi } from '../api/reviewApi';
import { formatCurrency, formatDate, getOrderStatusDetails } from '../utils/formatters';
import ReviewModal from '../components/review/ReviewModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { MapPin, Star, MessageSquare } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getBuyerOrders()
      .then(async (res) => {
        if (res?.data) {
          setOrders(res.data);
          // For completed orders, check if a review exists
          const completedOrders = res.data.filter((o) => o.status === 'COMPLETED');
          const reviews = {};
          await Promise.all(
            completedOrders.map(async (order) => {
              try {
                const rRes = await reviewApi.getOrderReview(order.id);
                if (rRes?.data) {
                  reviews[order.id] = rRes.data;
                }
              } catch (e) {
                // Ignore if no review exists
              }
            })
          );
          setReviewsMap(reviews);
        }
      })
      .catch((err) => console.error('Failed to load orders', err))
      .finally(() => setLoading(false));
  }, []);

  const handleReviewSubmitted = (newReview) => {
    setReviewsMap((prev) => ({
      ...prev,
      [newReview.orderId]: newReview,
    }));
  };

  if (loading) return <LoadingSpinner message="Loading your orders..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Orders & Offers</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track the status of your offers, reserved items, deliveries, and submit verified seller reviews.
        </p>
      </div>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            title="You haven't placed any orders yet"
            description="Explore our marketplace to find great deals on electronics, mobile phones, furniture, and more."
            actionText="Browse Marketplace"
            onAction={() => window.location.href = '/'}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getOrderStatusDetails(order.status);
              const review = reviewsMap[order.id];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-slate-300 transition"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={order.productImageUrl}
                      alt={order.productTitle}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          Placed {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{order.productTitle}</h4>
                      <p className="text-xs text-slate-500">
                        Seller: <strong>{order.sellerName}</strong>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Delivery to: {order.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 gap-2">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Offer Price</span>
                      <span className="text-2xl font-black text-slate-900">
                        {formatCurrency(order.offerPrice)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Original: {formatCurrency(order.productListedPrice)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 mt-1">
                      <Link
                        to={`/products/${order.productId}`}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                      >
                        View Item Details →
                      </Link>

                      {/* Verified Review Action for Completed Orders */}
                      {order.status === 'COMPLETED' && (
                        review ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>★ {review.rating}/5 Reviewed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedOrderForReview(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Rate & Review Seller</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={!!selectedOrderForReview}
        order={selectedOrderForReview}
        onClose={() => setSelectedOrderForReview(null)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}