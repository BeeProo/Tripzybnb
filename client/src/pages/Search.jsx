import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getListings } from '../api';
import ListingCard from '../components/listings/ListingCard';
import SkeletonCard from '../components/common/SkeletonCard';
import './Search.css';

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Pool', 'Parking', 'Kitchen', 'Gym', 'Spa', 'Restaurant', 'Beach Access'];
const TAG_OPTIONS = ['luxury', 'budget', 'beach', 'mountain', 'urban', 'heritage', 'adventure', 'romantic', 'eco', 'family', 'unique', 'business'];
const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    country: searchParams.get('country') || '',
    tags: searchParams.get('tags') || '',
    amenities: searchParams.get('amenities') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || '',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      const { data } = await getListings(params);
      setListings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = Object.fromEntries(
      Object.entries({ ...filters, page: '1' }).filter(([_, v]) => v)
    );
    setSearchParams(params);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const cleared = {
      search: '', city: '', country: '', tags: '', amenities: '',
      minPrice: '', maxPrice: '', minRating: '', sort: '', page: '1',
    };
    setFilters(cleared);
    setSearchParams({});
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] ? filters[key].split(',') : [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.join(','));
  };

  const goToPage = (page) => {
    const params = Object.fromEntries(
      Object.entries({ ...filters, page: String(page) }).filter(([_, v]) => v)
    );
    setFilters((prev) => ({ ...prev, page: String(page) }));
    setSearchParams(params);
  };

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => v && k !== 'page' && k !== 'sort' && k !== 'search')
    .length;

  return (
    <div className="page search-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <div className="search-bar-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, destination, or keyword..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              id="search-input"
            />
            <button className="btn btn-primary btn-sm" onClick={applyFilters} id="search-apply-btn">
              Search
            </button>
          </div>
          <div className="search-controls">
            <button
              className={`btn btn-secondary btn-sm ${filtersOpen ? 'active' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              id="toggle-filters-btn"
            >
              ☰ Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </button>
            <select
              className="sort-select"
              value={filters.sort}
              onChange={(e) => {
                updateFilter('sort', e.target.value);
                const params = Object.fromEntries(
                  Object.entries({ ...filters, sort: e.target.value, page: '1' }).filter(([_, v]) => v)
                );
                setSearchParams(params);
              }}
              id="sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="results-count">
              {pagination.total || 0} results
            </span>
          </div>
        </div>

        <div className="search-layout">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div className="filter-section">
              <h4>Location</h4>
              <input
                className="form-control"
                placeholder="City"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
              />
            </div>

            <div className="filter-section">
              <h4>Price Range (₹)</h4>
              <div className="price-range">
                <input
                  className="form-control"
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                />
                <span>—</span>
                <input
                  className="form-control"
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-section">
              <h4>Minimum Rating</h4>
              <select
                className="form-control"
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', e.target.value)}
              >
                <option value="">Any</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Tags</h4>
              <div className="filter-chips">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    className={`filter-chip ${filters.tags.split(',').includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleArrayFilter('tags', tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Amenities</h4>
              <div className="filter-chips">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    className={`filter-chip ${filters.amenities.split(',').includes(amenity) ? 'active' : ''}`}
                    onClick={() => toggleArrayFilter('amenities', amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
              <button className="btn btn-secondary" onClick={clearFilters}>Clear All</button>
            </div>
          </aside>

          {/* Results */}
          <main className="search-results">
            {loading ? (
              <div className="listing-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <h3>No listings found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="listing-grid">
                  {listings.map((listing, i) => (
                    <div key={listing._id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={pagination.page <= 1}
                      onClick={() => goToPage(pagination.page - 1)}
                    >
                      ← Previous
                    </button>
                    <span className="page-info">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => goToPage(pagination.page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
