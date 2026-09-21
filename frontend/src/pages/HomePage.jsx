import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Smartphone,
  Laptop,
  Car,
  Armchair,
  Shirt,
  BookOpen,
  Tv,
} from 'lucide-react';

const CATEGORY_ICONS = {
  mobiles: Smartphone,
  electronics: Laptop,
  vehicles: Car,
  furniture: Armchair,
  fashion: Shirt,
  books: BookOpen,
  appliances: Tv,
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam ? parseInt(categoryParam, 10) : '');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories once
  useEffect(() => {
    categoryApi.getAll()
      .then((res) => {
        if (res?.data) setCategories(res.data);
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Update selectedCategory if URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam, 10));
    }
  }, [categoryParam]);

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (queryParam) params.query = queryParam;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedCondition) params.condition = selectedCondition;
      if (selectedState) params.state = selectedState;
      if (cityQuery) params.city = cityQuery;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await productApi.getAll(params);
      let list = res?.data || [];

      // Client-side sorting
      if (sortBy === 'price-low') {
        list.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        list.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setProducts(list);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [queryParam, selectedCategory, selectedCondition, selectedState, cityQuery, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedState('');
    setCityQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const handleCategoryPillClick = (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory('');
      setSearchParams({});
    } else {
      setSelectedCategory(catId);
      setSearchParams({ category: catId });
    }
  };

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_50%)]" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Smart Way to Buy & Sell Used</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Discover Quality Pre-Loved Tech, Gear & Furniture.
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto mt-4 leading-relaxed">
            Verified sellers, direct negotiations, transparent product condition inspections, and zero surprise fees.
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8 pt-8 border-t border-emerald-700/50 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-[11px] font-medium text-emerald-200/80 uppercase">Verified Sellers</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">40-70%</p>
              <p className="text-[11px] font-medium text-emerald-200/80 uppercase">Average Savings</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">Instant</p>
              <p className="text-[11px] font-medium text-emerald-200/80 uppercase">Direct Offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Horizontal Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleCategoryPillClick('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              !selectedCategory
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Items</span>
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Sparkles;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryPillClick(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Results Bar & Sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {queryParam ? `Search results for "${queryParam}"` : 'Marketplace Listings'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {products.length} {products.length === 1 ? 'available item' : 'available items'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500 text-slate-700"
              >
                <option value="featured">Featured / Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters Desktop */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCondition={selectedCondition}
              onSelectCondition={setSelectedCondition}
              selectedState={selectedState}
              onSelectState={setSelectedState}
              cityQuery={cityQuery}
              onCityQueryChange={setCityQuery}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden flex justify-end">
              <div className="bg-white w-80 h-full p-5 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(c) => { setSelectedCategory(c); setShowMobileFilters(false); }}
                  selectedCondition={selectedCondition}
                  onSelectCondition={(c) => { setSelectedCondition(c); setShowMobileFilters(false); }}
                  selectedState={selectedState}
                  onSelectState={(s) => { setSelectedState(s); setShowMobileFilters(false); }}
                  cityQuery={cityQuery}
                  onCityQueryChange={(cq) => setCityQuery(cq)}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  onReset={() => { handleResetFilters(); setShowMobileFilters(false); }}
                />
              </div>
            </div>
          )}

          {/* Product Cards Grid */}
          <section className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner message="Searching marketplace items..." />
            ) : products.length === 0 ? (
              <EmptyState
                title="No items match your criteria"
                description="Try clearing your filters or search with different keywords to explore pre-owned products."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}