import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getListings, deleteListing, createListing, updateListing, getAllBookings, cancelBooking, getAllUsers, deleteUser, getAllHostRequests, approveHostRequest, rejectHostRequest } from '../api';
import './Admin.css';

const TABS = ['Listings', 'Bookings', 'Users', 'Host Requests'];

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Listings');
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hostRequests, setHostRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', 'location.city': '', 'location.state': '',
    'location.country': 'India', price: '', maxGuests: '6', images: '', amenities: '', tags: '',
  });

  // Host request review state
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, bookRes, userRes, hostRes] = await Promise.all([
        getListings({ limit: 100 }),
        getAllBookings(),
        getAllUsers(),
        getAllHostRequests(),
      ]);
      setListings(listRes.data.data);
      setBookings(bookRes.data.data);
      setUsers(userRes.data.data);
      setHostRequests(hostRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await deleteListing(id);
      toast.success('Listing deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their bookings/reviews?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await approveHostRequest(id, { adminNote: adminNote || 'Approved' });
      toast.success('Host request approved! Listing created and user promoted to host. 🎉');
      setReviewingRequest(null);
      setAdminNote('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectRequest = async (id) => {
    if (!adminNote.trim()) {
      toast.warning('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectHostRequest(id, { adminNote });
      toast.success('Host request rejected');
      setReviewingRequest(null);
      setAdminNote('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  const openCreateForm = () => {
    setEditingListing(null);
    setFormData({
      title: '', description: '', 'location.city': '', 'location.state': '',
      'location.country': 'India', price: '', maxGuests: '6', images: '', amenities: '', tags: '',
    });
    setShowForm(true);
  };

  const openEditForm = (listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      description: listing.description,
      'location.city': listing.location.city,
      'location.state': listing.location.state || '',
      'location.country': listing.location.country,
      price: listing.price,
      maxGuests: listing.maxGuests || 6,
      images: listing.images?.join(', ') || '',
      amenities: listing.amenities?.join(', ') || '',
      tags: listing.tags?.join(', ') || '',
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      location: {
        city: formData['location.city'],
        state: formData['location.state'],
        country: formData['location.country'],
      },
      price: Number(formData.price),
      maxGuests: Number(formData.maxGuests) || 6,
      images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingListing) {
        await updateListing(editingListing._id, payload);
      } else {
        await createListing(payload);
      }
      setShowForm(false);
      toast.success(editingListing ? 'Listing updated!' : 'Listing created!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const pendingHostRequests = hostRequests.filter((r) => r.status === 'pending');

  if (loading)
    return (
      <div className="page"><div className="loader"><div className="spinner" /></div></div>
    );

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{listings.length}</span>
            <span className="stat-label">Listings</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{bookings.length}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">₹{totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{pendingHostRequests.length}</span>
            <span className="stat-label">Pending Host Requests</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Host Requests' && pendingHostRequests.length > 0 && (
                <span className="tab-badge">{pendingHostRequests.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Listings Tab */}
        {activeTab === 'Listings' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>All Listings</h2>
              <button className="btn btn-primary" onClick={openCreateForm} id="add-listing-btn">
                + Add Listing
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Price/Night</th>
                    <th>Guests</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing._id}>
                      <td>
                        <div className="table-listing">
                          <img
                            src={listing.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=40'}
                            alt=""
                            className="table-thumb"
                          />
                          <span>{listing.title}</span>
                        </div>
                      </td>
                      <td>{listing.location.city}, {listing.location.country}</td>
                      <td>₹{listing.price.toLocaleString()}</td>
                      <td>{listing.maxGuests || '—'}</td>
                      <td>{listing.avgRating > 0 ? `${listing.avgRating.toFixed(1)} ★` : '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/listings/${listing._id}`)}>
                            View
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(listing)}>
                            Edit
                          </button>
                          <button className="btn btn-outline btn-sm" style={{ color: '#DC2626', borderColor: '#DC2626' }} onClick={() => handleDelete(listing._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'Bookings' && (
          <div className="admin-section">
            <h2>All Bookings</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Guest</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.listing?.title || 'Deleted'}</td>
                      <td>{booking.user?.name} ({booking.user?.email})</td>
                      <td>
                        {new Date(booking.checkIn).toLocaleDateString('en-IN')} → {new Date(booking.checkOut).toLocaleDateString('en-IN')}
                      </td>
                      <td>₹{booking.totalPrice?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === 'confirmed' && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#DC2626', borderColor: '#DC2626' }}
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div className="admin-section">
            <h2>All Users ({users.length})</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="table-listing">
                          <div className="user-avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`status-badge ${u.role === 'admin' ? 'status-admin' : u.role === 'host' ? 'status-host' : 'status-confirmed'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>
                        {u.role !== 'admin' && u._id !== user._id ? (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#DC2626', borderColor: '#DC2626' }}
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Host Requests Tab */}
        {activeTab === 'Host Requests' && (
          <div className="admin-section">
            <h2>Host Requests ({hostRequests.length})</h2>
            {hostRequests.length === 0 ? (
              <div className="empty-state" style={{ padding: 60 }}>
                <h3>No host requests</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Host applications will appear here</p>
              </div>
            ) : (
              <div className="host-req-list">
                {hostRequests.map((req) => (
                  <div key={req._id} className={`host-req-card ${reviewingRequest?._id === req._id ? 'expanded' : ''}`}>
                    <div className="host-req-header" onClick={() => setReviewingRequest(reviewingRequest?._id === req._id ? null : req)}>
                      <div className="host-req-user">
                        <div className="user-avatar-sm">{req.user?.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div>
                          <strong>{req.user?.name}</strong>
                          <small>{req.user?.email}</small>
                        </div>
                      </div>
                      <div className="host-req-property">
                        <strong>{req.propertyTitle}</strong>
                        <small>{req.propertyType} · {req.location?.city}, {req.location?.country}</small>
                      </div>
                      <div className="host-req-price">₹{req.price?.toLocaleString()}/night</div>
                      <span className={`status-badge status-${req.status}`}>{req.status}</span>
                      <span className="host-req-toggle">{reviewingRequest?._id === req._id ? '▲' : '▼'}</span>
                    </div>

                    {reviewingRequest?._id === req._id && (
                      <div className="host-req-details">
                        <div className="req-detail-grid">
                          <div><span>Max Guests</span><strong>{req.maxGuests}</strong></div>
                          <div><span>Phone</span><strong>{req.phone}</strong></div>
                          <div><span>Submitted</span><strong>{new Date(req.createdAt).toLocaleDateString('en-IN')}</strong></div>
                          <div><span>Amenities</span><strong>{req.amenities?.join(', ') || 'None'}</strong></div>
                        </div>
                        <div className="req-description">
                          <strong>Description:</strong>
                          <p>{req.propertyDescription}</p>
                        </div>
                        {req.message && (
                          <div className="req-description">
                            <strong>Host message:</strong>
                            <p>{req.message}</p>
                          </div>
                        )}
                        {req.images?.length > 0 && (
                          <div className="req-images">
                            {req.images.map((img, i) => (
                              <img key={i} src={img} alt={`Property ${i + 1}`} className="req-thumb" />
                            ))}
                          </div>
                        )}

                        {req.status === 'pending' && (
                          <div className="req-actions">
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                              <input
                                className="form-control"
                                placeholder="Admin note (required for rejection)..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                              />
                            </div>
                            <button className="btn btn-primary" onClick={() => handleApproveRequest(req._id)}>
                              ✓ Approve
                            </button>
                            <button className="btn btn-outline" style={{ color: '#DC2626', borderColor: '#DC2626' }} onClick={() => handleRejectRequest(req._id)}>
                              ✗ Reject
                            </button>
                          </div>
                        )}

                        {req.status !== 'pending' && (
                          <div className="req-reviewed">
                            <small>
                              {req.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                              {req.reviewedAt && ` on ${new Date(req.reviewedAt).toLocaleDateString('en-IN')}`}
                              {req.adminNote && ` — "${req.adminNote}"`}
                            </small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listing Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>{editingListing ? 'Edit Listing' : 'Create Listing'}</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input className="form-control" value={formData['location.city']} onChange={(e) => setFormData({ ...formData, 'location.city': e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input className="form-control" value={formData['location.state']} onChange={(e) => setFormData({ ...formData, 'location.state': e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input className="form-control" value={formData['location.country']} onChange={(e) => setFormData({ ...formData, 'location.country': e.target.value })} required />
                  </div>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Price per Night (₹)</label>
                    <input className="form-control" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Max Guests</label>
                    <input className="form-control" type="number" min="1" max="50" value={formData.maxGuests} onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URLs (comma-separated)</label>
                  <textarea className="form-control" rows="2" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>
                <div className="form-group">
                  <label>Amenities (comma-separated)</label>
                  <input className="form-control" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="WiFi, AC, Pool" />
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input className="form-control" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="luxury, beach, family" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {editingListing ? 'Update' : 'Create'} Listing
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
