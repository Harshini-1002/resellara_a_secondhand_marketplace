import React, { useState, useEffect, useRef } from 'react';
import { locationApi } from '../../api/locationApi';
import { MapPin, Search, Loader2 } from 'lucide-react';

export default function LocationAutocomplete({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Search Indian city, district, state or PIN...',
  required = false,
  className = '',
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await locationApi.search(query);
        setSuggestions(res?.data || []);
      } catch (err) {
        console.error('Location search failed', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (onChange) onChange(val);
  };

  const handleSelect = (item) => {
    const formatted = `${item.city}, ${item.state}`;
    setQuery(formatted);
    setIsOpen(false);
    if (onChange) onChange(formatted);
    if (onSelectLocation) onSelectLocation(item);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition ${className}`}
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto py-1 text-xs">
          {suggestions.map((loc, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(loc)}
              className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition border-b border-slate-50 last:border-0"
            >
              <div>
                <span className="font-bold text-slate-900">{loc.city}</span>
                <span className="text-slate-500 ml-1">({loc.district} dist, {loc.state})</span>
              </div>
              {loc.pinCode && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {loc.pinCode}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 text-xs text-slate-500 text-center">
          No matching Indian city found. You can enter your custom locality/village.
        </div>
      )}
    </div>
  );
}