import React, { useState, useEffect } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistApi.getWishlist()
      .then((res) => {
        if (res?.data) setWishlist(res.data);
      })
      .catch((err) => console.error('Failed to load wishlist', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading your saved items..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Saved Wishlist</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Items you have bookmarked to review or make an offer on later.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="mt-8">
        {wishlist.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            description="Explore our marketplace listings and tap the heart icon on any product to save it here."
            actionText="Start Browsing"
            onAction={() => window.location.href = '/'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}