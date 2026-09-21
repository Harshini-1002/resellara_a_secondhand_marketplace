import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const res = await wishlistApi.getWishlistIds();
      if (res?.data) {
        setWishlistIds(new Set(res.data));
      }
    } catch (err) {
      console.error('Failed to load wishlist IDs', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to save items to your wishlist');
      return false;
    }

    const productId = product.id;
    const isCurrentlyWishlisted = wishlistIds.has(productId);

    // Optimistic UI update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyWishlisted) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      const res = await wishlistApi.toggle(productId);
      const isWishlisted = res.data?.wishlisted;
      toast.success(isWishlisted ? 'Added to wishlist!' : 'Removed from wishlist');
      return isWishlisted;
    } catch (err) {
      // Revert optimistic update on error
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyWishlisted) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      toast.error('Could not update wishlist');
      return isCurrentlyWishlisted;
    }
  };

  const isWishlisted = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.size,
        toggleWishlist,
        isWishlisted,
        refreshWishlist: fetchWishlistIds,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};