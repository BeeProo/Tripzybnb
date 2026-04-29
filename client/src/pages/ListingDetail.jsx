import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing, getListingReviews, createReview, createBooking, checkAvailability, startConversation, addToWishlist, removeFromWishlist, checkWishlist } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/common/StarRating';
import SkeletonDetail from '../components/common/SkeletonDetail';
import ImageLightbox from '../components/common/ImageLightbox';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Booking state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false);

  // Message host state
  const [messagingHost, setMessagingHost] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchListing();
    fetchReviews();
    if (user && !isAdmin) {
      checkWishlist(id).then(({ data }) => setWishlisted(data.wishlisted)).catch(() => {});
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data } = await getListing(id);
      setListing(data.data);
    } catch {
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await getListingReviews(id);
      setReviews(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async () => {
    if (!user) return navigate('/login');
    if (!checkIn || !checkOut) {
      toast.warning('Please select check-in and check-out dates');
      return;
    }
    if (nights <= 0) return;

    setBookingLoading(true);

    try {
      // Check availability first
      const { data: avail } = await checkAvailability(id, { checkIn, checkOut });
      if (!avail.available) {
        toast.error('Dates not available. Please try different dates.');
        setBookingLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: 'rzp_test_Sj0u9e8aOZK11V',
        amount: totalPrice * 100, // Razorpay uses paise (1 INR = 100 paise)
        currency: 'INR',
        name: 'Tripzybnb',
        description: `${listing.title} — ${nights} night${nights > 1 ? 's' : ''}`,
        image: listing.images?.[0] || '',
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#FF385C',
        },
        handler: async function (response) {
          // Payment successful — create booking
          try {
            await createBooking({
              listing: id,
              checkIn,
              checkOut,
              guests,
              paymentDetails: {
                transactionId: response.razorpay_payment_id,
                status: 'paid',
                email: user.email,
              },
            });
            toast.success('Payment successful & Booking created! 🎉');
            setCheckIn('');
            setCheckOut('');
            navigate('/dashboard');
          } catch (err) {
            toast.error('Payment succeeded but booking failed. Contact support with ID: ' + response.razorpay_payment_id);
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBookingLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        toast.error('Payment failed: ' + (resp.error?.description || 'Unknown error'));
        setBookingLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      setBookingLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    try {
      await createReview(id, { rating: reviewRating, comment: reviewComment });
      toast.success('Review added successfully!');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
      fetchListing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleMessageHost = async () => {
    if (!user) return navigate('/login');

    const hostId = listing.createdBy?._id || listing.createdBy;
    if (!hostId) {
      toast.error('Host information not available');
      return;
    }

    if (hostId === user._id) {
      toast.info('This is your own listing');
      return;
    }

    setMessagingHost(true);
    try {
      const { data } = await startConversation({
        recipientId: hostId,
        listingId: listing._id,
      });
      toast.success('Conversation started!');
      navigate(`/messages?convo=${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation');
    } finally {
      setMessagingHost(false);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) return (
    <div className="page detail-page">
      <div className="container">
        <SkeletonDetail />
      </div>
    </div>
  );
  if (!listing) return null;

  const nights = calculateNights();
  const totalPrice = nights * listing.price;

  return (
    <div className="page detail-page">
      <div className="container">
        {/* Image Gallery */}
        <div className="gallery">
          <div className="gallery-main" onClick={() => setLightboxOpen(true)}>
            <img
              src={listing.images?.[activeImage] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
              alt={listing.title}
              className="gallery-main-img"
            />
            <div className="gallery-show-all">
              <span>📷 Show all photos</span>
            </div>
          </div>
          {listing.images?.length > 1 && (
            <div className="gallery-thumbs">
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${listing.title} ${i + 1}`}
                  className={`gallery-thumb ${i === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxOpen && listing.images?.length > 0 && (
          <ImageLightbox
            images={listing.images}
            initialIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
          />
        )}

        <div className="detail-layout">
          {/* Main Content */}
          <div className="detail-main">
            <div className="detail-header">
              <div className="detail-header-row">
                <h1>{listing.title}</h1>
                {user && !isAdmin && (
                  <button
                    className={`detail-save-btn ${wishlisted ? 'saved' : ''}`}
                    onClick={async () => {
                      if (wishlisted) {
                        await removeFromWishlist(id).catch(() => {});
                        setWishlisted(false);
                      } else {
                        await addToWishlist(id).catch(() => {});
                        setWishlisted(true);
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? '#FF385C' : 'none'} stroke={wishlisted ? '#FF385C' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {wishlisted ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>
              <div className="detail-meta">
                <span className="detail-location">📍 {listing.location.city}, {listing.location.state && `${listing.location.state}, `}{listing.location.country}</span>
                {listing.avgRating > 0 && (
                  <span className="detail-rating">
                    <StarRating rating={listing.avgRating} />
                    <strong>{listing.avgRating.toFixed(1)}</strong>
                    <span>({listing.reviewCount} reviews)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {listing.tags?.length > 0 && (
              <div className="detail-tags">
                {listing.tags.map((tag) => (
                  <span key={tag} className="badge badge-primary">{tag}</span>
                ))}
              </div>
            )}

            {/* Host Info */}
            <div className="detail-section host-section">
              <div className="host-card">
                <div className="host-info">
                  <div className="host-avatar">
                    {(listing.createdBy?.name || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>Hosted by {listing.createdBy?.name || 'Host'}</h3>
                    <p className="host-since">Joined {new Date(listing.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                {user && !isAdmin && (listing.createdBy?._id || listing.createdBy) !== user._id && (
                  <button
                    className="btn btn-secondary host-message-btn"
                    onClick={handleMessageHost}
                    disabled={messagingHost}
                    id="message-host-btn"
                  >
                    {messagingHost ? (
                      <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Starting...</>
                    ) : (
                      <><span>💬</span> Message Host</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h2>About this place</h2>
              <p className="detail-description">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className="detail-section">
                <h2>Amenities</h2>
                <div className="amenities-grid">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="detail-section">
              <h2>Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div className="review-avatar">
                          {review.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{review.user?.name}</strong>
                          <div className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="review-stars">
                          <StarRating rating={review.rating} size={14} />
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              {user && (
                <form className="review-form" onSubmit={handleReview}>
                  <h3>Write a Review</h3>
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-select">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`rating-star ${star <= reviewRating ? 'active' : ''}`}
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
              )}
            </div>
          </div>

          {/* Booking Widget */}
          <aside className="booking-widget">
            <div className="booking-card">
              <div className="booking-price">
                <strong>₹{listing.price.toLocaleString()}</strong>
                <span> / night</span>
              </div>

              <div className="booking-dates">
                <div className="booking-date-field">
                  <label>Check-in</label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    id="checkin-input"
                  />
                </div>
                <div className="booking-date-field">
                  <label>Check-out</label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    id="checkout-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Guests (max {listing.maxGuests || 6})</label>
                <select
                  className="form-control"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {Array.from({ length: listing.maxGuests || 6 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {nights > 0 && (
                <div className="booking-summary">
                  <div className="summary-row">
                    <span>₹{listing.price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="summary-total">
                    <strong>Total</strong>
                    <strong>₹{totalPrice.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg booking-btn"
                onClick={handleBooking}
                disabled={bookingLoading || nights <= 0}
                id="book-now-btn"
              >
                {bookingLoading ? (
                  <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing...</>
                ) : nights <= 0 ? (
                  'Select dates to Reserve'
                ) : (
                  `Pay ₹${totalPrice.toLocaleString()}`
                )}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
