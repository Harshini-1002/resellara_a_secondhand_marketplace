import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Phone, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LocationAutocomplete from '../common/LocationAutocomplete';
import toast from 'react-hot-toast';

export default function OrderModal({ isOpen, onClose, product, onSubmit }) {
  const { user } = useAuth();
  const [offerPrice, setOfferPrice] = useState(product?.price || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.city ? `${user.city}` : '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerPrice || !deliveryAddress || !contactPhone) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        productId: product.id,
        offerPrice: parseFloat(offerPrice),
        deliveryAddress,
        contactPhone,
        notes,
      });
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Make an Offer / Order</h3>
            <p className="text-xs text-slate-400">Directly connect with the seller to finalize in India.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-800 truncate">{product.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-slate-900">
                Listed: {formatCurrency(product.price)}
              </span>
              <span className="text-[10px] text-slate-500">
                Seller: {product.sellerName} ({product.location})
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Offer Price in INR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Offer / Agreed Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-bold text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              You can offer the listed price or propose a fair negotiated price.
            </p>
          </div>

          {/* Delivery / Meetup Address with Location Autocomplete */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Delivery / Meetup City & Area *
            </label>
            <LocationAutocomplete
              value={deliveryAddress}
              onChange={(val) => setDeliveryAddress(val)}
              onSelectLocation={(loc) => setDeliveryAddress(`${loc.city}, ${loc.district}, ${loc.state}`)}
              placeholder="Search Indian city or enter your neighborhood/address..."
              required
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Notes to Seller */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes for Seller (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                placeholder="Preferred meetup time, inspection questions, payment method (UPI / Cash)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>The seller will review your offer and contact you to arrange handoff. Full address is kept private.</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              {submitting ? 'Placing Order...' : 'Send Offer & Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}