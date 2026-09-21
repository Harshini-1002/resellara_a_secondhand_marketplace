import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, MapPin } from 'lucide-react';
import { locationApi } from '../../api/locationApi';

const CONDITIONS = [
  { id: 'LIKE_NEW', label: 'Like New' },
  { id: 'EXCELLENT', label: 'Excellent' },
  { id: 'GOOD', label: 'Good' },
  { id: 'FAIR', label: 'Fair' },
];

export default function ProductFilters({
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  selectedState,
  onSelectState,
  cityQuery,
  onCityQueryChange,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onReset,
}) {
  const [states, setStates] = useState([]);

  useEffect(() => {
    locationApi.getStates()
      .then((res) => {
        if (res?.data) setStates(res.data);
      })
      .catch((err) => console.error('Failed to load states', err));
  }, []);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 font-medium transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Region / Indian State Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Location & Region</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">State / Union Territory</label>
            <select
              value={selectedState}
              onChange={(e) => onSelectState(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 text-slate-800"
            >
              <option value="">All India (Any State)</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">City or District</label>
            <input
              type="text"
              placeholder="e.g. Hyderabad, Pune..."
              value={cityQuery}
              onChange={(e) => onCityQueryChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !selectedCategory
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Condition</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectCondition('')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !selectedCondition
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Any Condition
          </button>
          {CONDITIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCondition(c.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                selectedCondition === c.id
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range (INR) */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}