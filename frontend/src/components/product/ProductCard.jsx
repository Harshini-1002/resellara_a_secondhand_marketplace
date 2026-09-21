import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Tag } from 'lucide-react';
import { formatCurrency, getConditionDetails } from '../../utils/formatters';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const conditionInfo = getConditionDetails(product.itemCondition);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shadow-sm ${conditionInfo.badgeClass}`}>
            {conditionInfo.label}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-transform active:scale-90 ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Category Pill */}
        {product.categoryName && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-900/70 text-white backdrop-blur rounded-md">
              {product.categoryName}
            </span>
          </div>
        )}

        {/* Status Overlay */}
        {(product.status === 'RESERVED' || product.status === 'PENDING_SALE') && (
          <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 text-white text-[11px] font-black uppercase tracking-wider py-1 text-center backdrop-blur-sm shadow-sm">
            Reserved
          </div>
        )}
        {product.status === 'SOLD' && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-1.5 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-600 transition">
            {product.title}
          </h3>
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{product.location}</span>
          </div>
          <span className="font-medium text-slate-500 text-[11px] truncate">
            {product.sellerName || 'Verified Seller'}
          </span>
        </div>
      </div>
    </Link>
  );
}