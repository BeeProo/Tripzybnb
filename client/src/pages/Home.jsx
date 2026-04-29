import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedListings } from '../api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/listings/ListingCard';
import SkeletonCard from '../components/common/SkeletonCard';
import './Home.css';

const POPULAR_TAGS = ['luxury', 'beach', 'mountain', 'budget', 'heritage', 'adventure', 'romantic', 'eco'];
const DESTINATIONS = [
  { city: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', desc: 'Beach paradise' },
  { city: 'Manali', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400', desc: 'Mountain retreat' },
  { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', desc: 'Royal heritage' },
  { city: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', desc: 'Backwater bliss' },
  { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400', desc: 'City of dreams' },
  { city: 'Darjeeling', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400', desc: 'Tea gardens' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin, isHost } = useAuth();

  useEffect(() => {
    // Redirect admin and host to their dashboards
    if (isAdmin) { navigate('/admin', { replace: true }); return; }
    if (isHost) { navigate('/host-dashboard', { replace: true }); return; }
    loadFeatured();
  }, [user]);

  const loadFeatured = async () => {
    try {
      const { data } = await getFeaturedListings();
      setFeatured(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-overlay" />
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600"
            alt="Luxury hotel"
            className="hero-image"
          />
        </div>
        <div className="hero-content container">
          <h1 className="hero-title slide-up">
            Find your next<br />
            <span className="hero-accent">perfect stay</span>
          </h1>
          <p className="hero-subtitle slide-up">
            Discover unique homes, hotels, and experiences in stunning destinations across India.
          </p>
          <form className="hero-search slide-up" onSubmit={handleSearch}>
            <div className="hero-search-field">
              <label>Where to?</label>
              <input
                type="text"
                placeholder="Search destinations, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="hero-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg hero-search-btn" id="hero-search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Tag Filters */}
      <section className="tags-section container">
        <div className="tags-strip">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              className="tag-chip"
              onClick={() => navigate(`/search?tags=${tag}`)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section container">
        <div className="section-header">
          <h2>Featured Stays</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/search')}>
            View all →
          </button>
        </div>
        {loading ? (
          <div className="listing-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <div className="listing-grid">
            {featured.map((listing, i) => (
              <div key={listing._id} className="fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Destinations */}
      <section className="section container">
        <div className="section-header">
          <h2>Popular Destinations</h2>
        </div>
        <div className="destinations-grid">
          {DESTINATIONS.map((dest, i) => (
            <div
              key={dest.city}
              className="dest-card fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => navigate(`/search?city=${dest.city}`)}
            >
              <img src={dest.img} alt={dest.city} className="dest-img" />
              <div className="dest-info">
                <h3>{dest.city}</h3>
                <p>{dest.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to explore?</h2>
          <p>Join thousands of travelers finding their perfect stay on Tripzybnb</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/search')}>
            Start Exploring
          </button>
        </div>
      </section>
    </div>
  );
}
