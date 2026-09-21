import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Info, MapPin } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { formatCurrency } from '../../utils/formatters';
import LocationAutocomplete from '../common/LocationAutocomplete';
import toast from 'react-hot-toast';

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData = null, categories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    itemCondition: 'LIKE_NEW',
    price: '',
    originalPrice: '',
    imageUrl: '',
    location: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // AI Price Suggestion State
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [calcAgeMonths, setCalcAgeMonths] = useState(6);
  const [calcLoading, setCalcLoading] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId || '',
        itemCondition: initialData.itemCondition || 'LIKE_NEW',
        price: initialData.price || '',
        originalPrice: initialData.originalPrice || '',
        imageUrl: initialData.imageUrl || '',
        location: initialData.location || '',
        state: initialData.state || '',
        district: initialData.district || '',
        city: initialData.city || '',
        pincode: initialData.pincode || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '',
        itemCondition: 'LIKE_NEW',
        price: '',
        originalPrice: '',
        imageUrl: '',
        location: 'Hyderabad, Telangana',
        state: 'Telangana',
        district: 'Hyderabad',
        city: 'Hyderabad',
        pincode: '500081',
      });
    }
    setPriceSuggestion(null);
    setShowPriceCalculator(false);
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc) => {
    setFormData((prev) => ({
      ...prev,
      location: `${loc.city}, ${loc.state}`,
      city: loc.city,
      district: loc.district,
      state: loc.state,
      pincode: loc.pinCode || '',
    }));
  };

  const handleCalculatePrice = async () => {
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      toast.error('Please enter the original purchase price first');
      return;
    }

    setCalcLoading(true);
    try {
      const selectedCat = categories.find((c) => c.id === parseInt(formData.categoryId, 10));
      const res = await productApi.getPriceSuggestion({
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        categoryName: selectedCat?.name || '',
        title: formData.title,
        originalPrice: parseFloat(formData.originalPrice),
        ageInMonths: parseInt(calcAgeMonths, 10) || 6,
        itemCondition: formData.itemCondition,
      });

      setPriceSuggestion(res.data);
      toast.success('Resale price range estimated successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not calculate price suggestion');
    } finally {
      setCalcLoading(false);
    }
  };

  const applySuggestedPrice = () => {
    if (priceSuggestion?.suggestedPrice) {
      setFormData((prev) => ({
        ...prev,
        price: priceSuggestion.suggestedPrice,
      }));
      toast.success(`Applied ${formatCurrency(priceSuggestion.suggestedPrice)} as selling price`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.categoryId || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        categoryId: parseInt(formData.categoryId, 10),
      });
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Marketplace Listing' : 'Post an Item for Sale'}
            </h3>
            <p className="text-xs text-slate-400">Reach verified buyers across India.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. iPhone 14 Pro 256GB Deep Purple"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Condition *
              </label>
              <select
                required
                value={formData.itemCondition}
                onChange={(e) => setFormData({ ...formData, itemCondition: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
              >
                <option value="LIKE_NEW">Like New (zero flaws, barely used)</option>
                <option value="EXCELLENT">Excellent (minimal wear, fully functional)</option>
                <option value="GOOD">Good (normal light wear, works great)</option>
                <option value="FAIR">Fair (visible wear, operational)</option>
              </select>
            </div>
          </div>

          {/* Pricing (in INR ₹) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="24999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Original Retail Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="1"
                  placeholder="34990 (for % discount)"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* AI-Assisted Resale Price Suggestion Section */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  AI Resale Price Suggestion
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceCalculator(!showPriceCalculator)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {showPriceCalculator ? 'Hide Estimator' : 'Get Price Recommendation'}
              </button>
            </div>

            {showPriceCalculator && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Product Usage Duration / Age
                    </label>
                    <select
                      value={calcAgeMonths}
                      onChange={(e) => setCalcAgeMonths(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500"
                    >
                      <option value="1">Under 1 Month (Almost New)</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">1 Year</option>
                      <option value="18">1.5 Years</option>
                      <option value="24">2 Years</option>
                      <option value="36">3+ Years</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={calcLoading}
                      onClick={handleCalculatePrice}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{calcLoading ? 'Calculating...' : 'Estimate Resale Price'}</span>
                    </button>
                  </div>
                </div>

                {priceSuggestion && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-sm mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Suggested Resale Price Range
                        </span>
                        <span className="text-base font-black text-emerald-700">
                          {formatCurrency(priceSuggestion.minPrice)} – {formatCurrency(priceSuggestion.maxPrice)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={applySuggestedPrice}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply {formatCurrency(priceSuggestion.suggestedPrice)}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {priceSuggestion.explanation}
                    </p>
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      * This is an algorithmic market recommendation. You can choose any selling price you prefer.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Searchable Indian Location Autocomplete */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Item Location (Indian City / State) *
            </label>
            <LocationAutocomplete
              value={formData.location}
              onChange={(val) => setFormData({ ...formData, location: val })}
              onSelectLocation={handleSelectLocation}
              placeholder="Search Indian city e.g. Hyderabad, Bengaluru, Pune..."
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Only the city and state will be shown publicly.
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Image URL (Direct link from Unsplash, Imgur, etc.)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
            />
            {formData.imageUrl && (
              <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe condition, bill availability, included accessories, reason for selling..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
            />
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
              {submitting ? 'Saving Listing...' : initialData ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}