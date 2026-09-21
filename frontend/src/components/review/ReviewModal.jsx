import React, { useState } from 'react';
import { X, Star, ShieldCheck } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import toast from 'react-hot-toast';

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const ratingLabels = {
    1: 'Poor - Did not match expectations',
    2: 'Fair - Below average experience',
    3: 'Good - Met basic expectations',
    4: 'Very Good - Great condition & communication',
    5: 'Excellent - Flawless deal & recommended!',
  };

  const currentDisplayRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewApi.create({
        orderId: order.id,
        rating,
        comment: comment.trim(),
      });
      toast.success('Thank you! Your verified review has been submitted.');
      if (onReviewSubmitted) {
        onReviewSubmitted(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Purchase Review</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">Rate Your Experience</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Order Details Preview */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            {order.productImageUrl && (
              <img
                src={order.productImageUrl}
                alt={order.productTitle}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">{order.productTitle}</h4>
              <p className="text-xs text-slate-500">
                Seller: <strong>{order.sellerName}</strong>
              </p>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= currentDisplayRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2 h-4">
              {ratingLabels[currentDisplayRating]}
            </p>
          </div>

          {/* Written Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Review (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="How was the product condition? Was the seller responsive and transparent? Share your feedback to help other buyers..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
