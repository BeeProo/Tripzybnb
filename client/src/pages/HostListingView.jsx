import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getListing, getListingBookings, getListingReviews, confirmBooking, cancelBooking } from '../api';
import './HostListingView.css';

export default function HostListingView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'host' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchAll();
  }, [user, id]);

  const fetchAll = async () => {
    try {
      const [listRes, bookRes, revRes] = await Promise.all([
        getListing(id),
        getListingBookings(id),
        getListingReviews(id),
      ]);
      setListing(listRes.data.data);
      setBookings(bookRes.data.data || []);
      setReviews(revRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load listing details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await confirmBooking(bookingId);
      toast.success('Booking confirmed! ✅');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="page"><div className="loader"><div className="spinner" /></div></div>
  );

  if (!listing) return (
    <div className="page"><div className="container"><p>Listing not found.</p></div></div>
  );

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="page host-listing-view">
      <div className="container">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/host-dashboard')} style={{ marginBottom: 20 }}>
          ← Back to Dashboard
        </button>

        {/* Listing Header */}
        <div className="hlv-header">
          <div className="hlv-header-img">
            <img
              src={listing.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
              alt={listing.title}
            />
          </div>
          <div className="hlv-header-info">
            <h1>{listing.title}</h1>
            <p className="hlv-location">📍 {listing.location?.city}, {listing.location?.state && `${listing.location.state}, `}{listing.location?.country}</p>
            <div className="hlv-meta-row">
              <span className="hlv-price">₹{listing.price?.toLocaleString()} <small>/ night</small></span>
              <span className="hlv-guests">👥 {listing.maxGuests || 6} guests max</span>
              {listing.avgRating > 0 && (
                <span className="hlv-rating">★ {listing.avgRating.toFixed(1)} ({listing.reviewCount} reviews)</span>
              )}
            </div>
            <div className="hlv-stats-row">
              <div className="hlv-stat">
                <strong>{pendingBookings.length}</strong>
                <small>Pending</small>
              </div>
              <div className="hlv-stat">
                <strong>{confirmedBookings.length}</strong>
                <small>Confirmed</small>
              </div>
              <div className="hlv-stat">
                <strong>{bookings.length}</strong>
                <small>Total</small>
              </div>
              <div className="hlv-stat">
                <strong>₹{totalRevenue.toLocaleString()}</strong>
                <small>Revenue</small>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="hlv-tabs">
          <button className={`hlv-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            Bookings ({bookings.length})
            {pendingBookings.length > 0 && <span className="hlv-tab-badge">{pendingBookings.length}</span>}
          </button>
          <button className={`hlv-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Reviews ({reviews.length})
          </button>
          <button className={`hlv-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
            Property Details
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="hlv-section">
            {bookings.length === 0 ? (
              <div className="hlv-empty">
                <span>📋</span>
                <h3>No bookings yet</h3>
                <p>When customers book this property, their details will appear here.</p>
              </div>
            ) : (
              <div className="hlv-bookings-list">
                {/* Pending bookings first */}
                {pendingBookings.length > 0 && (
                  <div className="hlv-booking-section">
                    <h3 className="hlv-booking-section-title">⏳ Pending Approval ({pendingBookings.length})</h3>
                    {pendingBookings.map((booking) => renderBookingCard(booking))}
                  </div>
                )}
                {confirmedBookings.length > 0 && (
                  <div className="hlv-booking-section">
                    <h3 className="hlv-booking-section-title">✅ Confirmed ({confirmedBookings.length})</h3>
                    {confirmedBookings.map((booking) => renderBookingCard(booking))}
                  </div>
                )}
                {cancelledBookings.length > 0 && (
                  <div className="hlv-booking-section">
                    <h3 className="hlv-booking-section-title">❌ Cancelled ({cancelledBookings.length})</h3>
                    {cancelledBookings.map((booking) => renderBookingCard(booking))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="hlv-section">
            {reviews.length === 0 ? (
              <div className="hlv-empty">
                <span>⭐</span>
                <h3>No reviews yet</h3>
                <p>Customer reviews will appear here after their stay.</p>
              </div>
            ) : (
              <div className="hlv-reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="hlv-review-card">
                    <div className="hlv-review-header">
                      <div className="hlv-customer-avatar small">
                        {review.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <strong>{review.user?.name}</strong>
                        <small>{new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</small>
                      </div>
                      <span className="hlv-review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p className="hlv-review-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Details Tab */}
        {activeTab === 'details' && (
          <div className="hlv-section">
            <div className="hlv-details-grid">
              <div className="hlv-detail-block">
                <h3>Description</h3>
                <p>{listing.description}</p>
              </div>
              {listing.amenities?.length > 0 && (
                <div className="hlv-detail-block">
                  <h3>Amenities</h3>
                  <div className="hlv-amenity-tags">
                    {listing.amenities.map((a, i) => (
                      <span key={i} className="hlv-amenity-tag">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {listing.images?.length > 1 && (
                <div className="hlv-detail-block">
                  <h3>Gallery ({listing.images.length} images)</h3>
                  <div className="hlv-gallery">
                    {listing.images.map((img, i) => (
                      <img key={i} src={img} alt={`Property ${i + 1}`} className="hlv-gallery-img" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderBookingCard(booking) {
    const isActioning = actionLoading === booking._id;
    return (
      <div key={booking._id} className={`hlv-booking-card ${booking.status}`}>
        <div className="hlv-booking-customer">
          <div className="hlv-customer-avatar">
            {booking.user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="hlv-customer-info">
            <strong>{booking.user?.name || 'Unknown'}</strong>
            <small>{booking.user?.email}</small>
            {booking.user?.phone && <small>📞 {booking.user.phone}</small>}
          </div>
        </div>
        <div className="hlv-booking-dates">
          <div>
            <small>Check-in</small>
            <strong>{new Date(booking.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
          <span className="hlv-date-arrow">→</span>
          <div>
            <small>Check-out</small>
            <strong>{new Date(booking.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
        </div>
        <div className="hlv-booking-details">
          <span>👥 {booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
          <span className="hlv-booking-amount">₹{booking.totalPrice?.toLocaleString()}</span>
          {booking.paymentDetails?.transactionId && (
            <span className="paid-badge-small" style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>✅ PAID</span>
          )}
        </div>
        <div className="hlv-booking-status-actions">
          <span className={`status-badge status-${booking.status}`}>
            {booking.status}
          </span>
          {booking.status === 'pending' && (
            <div className="hlv-action-btns">
              <button
                className="btn btn-sm btn-confirm"
                onClick={() => handleConfirm(booking._id)}
                disabled={isActioning}
              >
                {isActioning ? '...' : '✅ Confirm'}
              </button>
              <button
                className="btn btn-sm btn-cancel"
                onClick={() => handleCancel(booking._id)}
                disabled={isActioning}
              >
                {isActioning ? '...' : '❌ Reject'}
              </button>
            </div>
          )}
          {booking.status === 'confirmed' && (
            <button
              className="btn btn-sm btn-cancel-light"
              onClick={() => handleCancel(booking._id)}
              disabled={isActioning}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    );
  }
}
