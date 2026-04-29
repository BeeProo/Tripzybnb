import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const upcoming = bookings.filter(
    (b) => (b.status === 'confirmed' || b.status === 'pending') && new Date(b.checkIn) >= new Date()
  );

  const past = bookings.filter(
    (b) => b.status !== 'confirmed' || new Date(b.checkIn) < new Date()
  );

  if (loading)
    return (
      <div className="page">
        <div className="loader"><div className="spinner" /></div>
      </div>
    );

  return (
    <div className="page dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1>My Trips</h1>
          <p className="dash-subtitle">Welcome back, {user?.name}!</p>
        </div>

        {/* Upcoming */}
        <section className="dash-section">
          <h2>Upcoming Trips ({upcoming.length})</h2>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming trips. Time to explore!</p>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {upcoming.map((booking) => (
                <div key={booking._id} className="booking-item">
                  <img
                    src={booking.listing?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                    alt={booking.listing?.title}
                    className="booking-img"
                    onClick={() => navigate(`/listings/${booking.listing?._id}`)}
                  />
                  <div className="booking-info">
                    <h3 onClick={() => navigate(`/listings/${booking.listing?._id}`)}>
                      {booking.listing?.title || 'Listing'}
                    </h3>
                    <p className="booking-loc">
                      📍 {booking.listing?.location?.city}, {booking.listing?.location?.country}
                    </p>
                    <div className="booking-dates-info">
                      <span>{new Date(booking.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      <span> → </span>
                      <span>{new Date(booking.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="booking-price-row">
                      <p className="booking-total">₹{booking.totalPrice?.toLocaleString()}</p>
                      {booking.paymentDetails?.transactionId && (
                        <span className="paid-badge">✅ PAID</span>
                      )}
                    </div>
                  </div>
                  <div className="booking-actions">
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                    {booking.status === 'confirmed' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleCancel(booking._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Trips */}
        {past.length > 0 && (
          <section className="dash-section">
            <h2>Past Trips ({past.length})</h2>
            <div className="bookings-list">
              {past.map((booking) => (
                <div key={booking._id} className="booking-item past">
                  <img
                    src={booking.listing?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                    alt={booking.listing?.title}
                    className="booking-img"
                  />
                  <div className="booking-info">
                    <h3>{booking.listing?.title || 'Listing'}</h3>
                    <div className="booking-dates-info">
                      <span>{new Date(booking.checkIn).toLocaleDateString('en-IN')}</span>
                      <span> → </span>
                      <span>{new Date(booking.checkOut).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="booking-total">₹{booking.totalPrice?.toLocaleString()}</p>
                  </div>
                  <div className="booking-actions">
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
