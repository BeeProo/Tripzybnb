import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMyListings, getMyHostRequests, updateListing, deleteListing, getHostAllBookings } from '../api';
import './HostDashboard.css';

export default function HostDashboard() {
  const { user, isHost, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [hostBookings, setHostBookings] = useState([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', 'location.city': '', 'location.state': '',
    'location.country': 'India', price: '', maxGuests: '6', images: '', amenities: '', tags: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/host/login'); return; }
    if (isAdmin) { navigate('/admin'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [listRes, reqRes, bookRes] = await Promise.all([
        getMyListings(),
        getMyHostRequests(),
        getHostAllBookings(),
      ]);
      setListings(listRes.data.data || []);
      setRequests(reqRes.data.data || []);
      setHostBookings(bookRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal for a listing
  const openEditModal = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title || '',
      description: listing.description || '',
      'location.city': listing.location?.city || '',
      'location.state': listing.location?.state || '',
      'location.country': listing.location?.country || 'India',
      price: listing.price || '',
      maxGuests: listing.maxGuests || 6,
      images: listing.images?.join(', ') || '',
      amenities: listing.amenities?.join(', ') || '',
      tags: listing.tags?.join(', ') || '',
    });
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        location: {
          city: editForm['location.city'],
          state: editForm['location.state'],
          country: editForm['location.country'],
        },
        price: Number(editForm.price),
        maxGuests: Number(editForm.maxGuests) || 6,
        images: editForm.images.split(',').map((s) => s.trim()).filter(Boolean),
        amenities: editForm.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        tags: editForm.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await updateListing(editingListing._id, payload);
      toast.success('Listing updated successfully! ✨');
      setShowEditModal(false);
      setEditingListing(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const activeListings = listings.filter(Boolean);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  if (loading) return (
    <div className="page"><div className="loader"><div className="spinner" /></div></div>
  );

  return (
    <div className="page host-dashboard-page">
      <div className="container">
        {/* Dashboard Header */}
        <div className="host-dash-header">
          <div className="host-dash-welcome">
            <div className="host-dash-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>Host Dashboard</h1>
              <p>Welcome back, {user?.name}! Manage your properties below.</p>
            </div>
          </div>
          <button className="btn btn-host-action" onClick={() => navigate('/become-host')} id="add-property-btn">
            + Request New Property
          </button>
        </div>

        {/* Stats */}
        <div className="host-stats-grid">
          <div className="host-stat-card">
            <div className="host-stat-icon">🏠</div>
            <span className="host-stat-number">{activeListings.length}</span>
            <span className="host-stat-label">Active Listings</span>
          </div>
          <div className="host-stat-card">
            <div className="host-stat-icon">⏳</div>
            <span className="host-stat-number">{pendingRequests.length}</span>
            <span className="host-stat-label">Pending Requests</span>
          </div>
          <div className="host-stat-card">
            <div className="host-stat-icon">✅</div>
            <span className="host-stat-number">{approvedRequests.length}</span>
            <span className="host-stat-label">Approved</span>
          </div>
          <div className="host-stat-card">
            <div className="host-stat-icon">❌</div>
            <span className="host-stat-number">{rejectedRequests.length}</span>
            <span className="host-stat-label">Rejected</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="host-tabs">
          <button
            className={`host-tab ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            My Listings ({activeListings.length})
          </button>
          <button
            className={`host-tab ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            New Customers ({hostBookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            className={`host-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Request History ({requests.length})
          </button>
        </div>

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <section className="host-section">
            {activeListings.length === 0 ? (
              <div className="host-empty-state">
                <span className="host-empty-icon">🏡</span>
                <h3>No active listings yet</h3>
                <p>Once your host request is approved, your listings will appear here.</p>
                <button className="btn btn-host-action" onClick={() => navigate('/become-host')}>
                  Request a Property
                </button>
              </div>
            ) : (
              <div className="host-listings-grid">
                {activeListings.map((listing) => (
                  <div key={listing._id} className="host-listing-card">
                    <div className="host-listing-img-wrapper" onClick={() => navigate(`/listings/${listing._id}`)}>
                      <img
                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'}
                        alt={listing.title}
                        className="host-listing-img"
                      />
                      {listing.avgRating > 0 && (
                        <span className="host-listing-badge">★ {listing.avgRating.toFixed(1)}</span>
                      )}
                    </div>
                    <div className="host-listing-body">
                      <h3 onClick={() => navigate(`/listings/${listing._id}`)}>{listing.title}</h3>
                      <p className="host-listing-loc">📍 {listing.location?.city}, {listing.location?.country}</p>
                      <div className="host-listing-meta">
                        <span className="host-listing-price">₹{listing.price?.toLocaleString()} <small>/ night</small></span>
                        <span className="host-listing-guests">👥 {listing.maxGuests} guests</span>
                      </div>
                      <div className="host-listing-actions">
                        <button
                          className="btn btn-sm btn-edit-listing"
                          onClick={() => openEditModal(listing)}
                          id={`edit-listing-${listing._id}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-view-listing"
                          onClick={() => navigate(`/host/listing/${listing._id}`)}
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Request History Tab */}
        {activeTab === 'requests' && (
          <section className="host-section">
            {requests.length === 0 ? (
              <div className="host-empty-state">
                <span className="host-empty-icon">📋</span>
                <h3>No requests submitted yet</h3>
                <p>Submit your first property to get started!</p>
                <button className="btn btn-host-action" onClick={() => navigate('/become-host')}>
                  Become a Host
                </button>
              </div>
            ) : (
              <div className="host-requests-table">
                {requests.map((req) => (
                  <div key={req._id} className="host-request-row">
                    <div className="request-row-info">
                      <strong>{req.propertyTitle}</strong>
                      <small>{req.propertyType} · {req.location?.city}, {req.location?.country}</small>
                    </div>
                    <div className="request-row-price">₹{req.price?.toLocaleString()}/night</div>
                    <div className="request-row-date">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    {req.adminNote && req.status !== 'pending' && (
                      <div className="request-row-note">
                        <small>Admin: {req.adminNote}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* New Customers Tab */}
        {activeTab === 'customers' && (
          <section className="host-section">
            {hostBookings.filter((b) => b.status === 'confirmed').length === 0 ? (
              <div className="host-empty-state">
                <span className="host-empty-icon">👥</span>
                <h3>No confirmed bookings yet</h3>
                <p>Bookings will appear here once customers complete payment.</p>
              </div>
            ) : (
              <div className="host-customers-list">
                {hostBookings
                  .filter((b) => b.status === 'confirmed')
                  .map((booking) => (
                    <div key={booking._id} className="host-customer-card">
                      <div className="hc-avatar">
                        {booking.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="hc-info">
                        <strong>{booking.user?.name || 'Guest'}</strong>
                        <small>{booking.user?.email}</small>
                      </div>
                      <div className="hc-property">
                        <span className="hc-property-name">{booking.listing?.title}</span>
                        <small>📍 {booking.listing?.location?.city}, {booking.listing?.location?.country}</small>
                      </div>
                      <div className="hc-dates">
                        <small>Check-in</small>
                        <span>{new Date(booking.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="hc-dates">
                        <small>Check-out</small>
                        <span>{new Date(booking.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="hc-amount">
                        <strong>₹{booking.totalPrice?.toLocaleString()}</strong>
                        {booking.paymentDetails?.transactionId && (
                          <span className="hc-paid">✅ Paid</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* Edit Listing Modal */}

        {showEditModal && editingListing && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-card host-edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="host-edit-header">
                <h2>Edit Listing</h2>
                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows="3" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input className="form-control" value={editForm['location.city']} onChange={(e) => setEditForm({ ...editForm, 'location.city': e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input className="form-control" value={editForm['location.state']} onChange={(e) => setEditForm({ ...editForm, 'location.state': e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input className="form-control" value={editForm['location.country']} onChange={(e) => setEditForm({ ...editForm, 'location.country': e.target.value })} required />
                  </div>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Price per Night (₹)</label>
                    <input className="form-control" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Max Guests</label>
                    <input className="form-control" type="number" min="1" max="50" value={editForm.maxGuests} onChange={(e) => setEditForm({ ...editForm, maxGuests: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URLs (comma-separated)</label>
                  <textarea className="form-control" rows="2" value={editForm.images} onChange={(e) => setEditForm({ ...editForm, images: e.target.value })} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>
                <div className="form-group">
                  <label>Amenities (comma-separated)</label>
                  <input className="form-control" value={editForm.amenities} onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })} placeholder="WiFi, AC, Pool" />
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input className="form-control" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="luxury, beach, family" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-host-action" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
