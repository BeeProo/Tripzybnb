import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ListingCard from '../components/listings/ListingCard';
import { getWishlist, removeFromWishlist } from '../api';

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await getWishlist();
      setWishlist(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId) => {
    try {
      await removeFromWishlist(listingId);
      setWishlist((prev) => prev.filter((item) => item.listing?._id !== listingId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading)
    return (
      <div className="page">
        <div className="loader"><div className="spinner" /></div>
      </div>
    );

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <div className="container">
        <div className="page-header">
          <h1>♡ My Wishlist</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            {wishlist.length} saved {wishlist.length === 1 ? 'place' : 'places'}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>No saved places yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Tap the heart icon on any listing to save it here
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/search')}>
              Explore Listings
            </button>
          </div>
        ) : (
          <div className="listing-grid" style={{ paddingTop: 20 }}>
            {wishlist.map((item, i) => (
              <div key={item._id} className="fade-in" style={{ animationDelay: `${i * 0.08}s`, position: 'relative' }}>
                <button
                  onClick={() => handleRemove(item.listing?._id)}
                  style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 10,
                    background: 'rgba(0,0,0,0.5)', color: '#FF385C', border: 'none',
                    borderRadius: '50%', width: 36, height: 36, fontSize: '1.2rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Remove from wishlist"
                >
                  ♥
                </button>
                {item.listing && <ListingCard listing={item.listing} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
