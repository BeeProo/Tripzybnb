import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../../api';
import StarRating from '../common/StarRating';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const { _id, title, images, location, price, avgRating, reviewCount, tags } = listing;
  const { user, isHost, isAdmin } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (user && !isHost && !isAdmin) {
      checkWishlist(_id)
        .then(({ data }) => setWishlisted(data.wishlisted))
        .catch(() => {});
    }
  }, [_id, user]);

  const toggleWishlist = async (e) => {
    e.preventDefault(); // Prevent navigating to listing
    e.stopPropagation();
    if (!user) return;
    if (toggling) return;

    setToggling(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(_id);
        setWishlisted(false);
      } else {
        await addToWishlist(_id);
        setWishlisted(true);
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  };

  return (
    <Link to={`/listings/${_id}`} className="listing-card" id={`listing-card-${_id}`}>
      <div className="card-image-wrapper">
        <img
          src={images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
          alt={title}
          className="card-image"
          loading="lazy"
        />
        {tags?.[0] && (
          <span className="card-tag">{tags[0]}</span>
        )}
        {/* Wishlist Heart — only for regular users */}
        {user && !isHost && !isAdmin && (
          <button
            className={`card-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
            onClick={toggleWishlist}
            disabled={toggling}
            title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Toggle wishlist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? '#FF385C' : 'none'} stroke={wishlisted ? '#FF385C' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {avgRating > 0 && (
            <div className="card-rating">
              <StarRating rating={avgRating} size={14} />
              <span>{avgRating.toFixed(1)}</span>
              <span className="card-review-count">({reviewCount})</span>
            </div>
          )}
        </div>
        <p className="card-location">
          📍 {location.city}, {location.country}
        </p>
        <p className="card-price">
          <strong>₹{price.toLocaleString()}</strong>
          <span> / night</span>
        </p>
      </div>
    </Link>
  );
}
