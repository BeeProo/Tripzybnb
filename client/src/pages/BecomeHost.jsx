import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createHostRequest, getMyHostRequests } from '../api';
import './BecomeHost.css';

const PROPERTY_TYPES = ['Hotel', 'Villa', 'Apartment', 'Cottage', 'Resort', 'Homestay', 'Hostel', 'Other'];
const AMENITY_OPTIONS = ['WiFi', 'AC', 'Pool', 'Parking', 'Kitchen', 'Gym', 'Spa', 'Restaurant', 'Beach Access', 'Room Service', 'Laundry', 'TV', 'Hot Water', 'Power Backup', 'Garden'];

export default function BecomeHost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingRequests, setExistingRequests] = useState([]);
  const [checkingRequests, setCheckingRequests] = useState(true);

  const [form, setForm] = useState({
    propertyTitle: '',
    propertyDescription: '',
    propertyType: '',
    'location.city': '',
    'location.state': '',
    'location.country': 'India',
    'location.address': '',
    price: '',
    maxGuests: '',
    amenities: [],
    images: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }
    fetchExistingRequests();
  }, [user]);

  const fetchExistingRequests = async () => {
    try {
      const { data } = await getMyHostRequests();
      setExistingRequests(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingRequests(false);
    }
  };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        propertyTitle: form.propertyTitle,
        propertyDescription: form.propertyDescription,
        propertyType: form.propertyType,
        location: {
          city: form['location.city'],
          state: form['location.state'],
          country: form['location.country'],
          address: form['location.address'],
        },
        price: Number(form.price),
        maxGuests: Number(form.maxGuests),
        amenities: form.amenities,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        phone: form.phone,
        message: form.message,
      };
      await createHostRequest(payload);
      toast.success('Property request submitted! The admin will review it soon. 🎉');
      navigate(user.role === 'host' ? '/host-dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const pendingRequest = existingRequests.find((r) => r.status === 'pending');

  const canProceed = () => {
    if (step === 1) return form.propertyTitle && form.propertyType && form.propertyDescription;
    if (step === 2) return form['location.city'] && form['location.country'] && form.price && form.maxGuests;
    if (step === 3) return form.phone;
    return true;
  };

  if (checkingRequests) return (
    <div className="page"><div className="loader"><div className="spinner" /></div></div>
  );

  return (
    <div className="page become-host-page">
      <div className="container">
        {/* Hero */}
        <div className="host-hero">
          <h1>{user?.role === 'host' ? <>Add a <span className="hero-accent">New Property</span></> : <>Become a <span className="hero-accent">Host</span></>}</h1>
          <p>{user?.role === 'host' ? 'Submit a new property for admin approval' : 'Share your property with travelers from around the world and start earning'}</p>
        </div>

        {/* Pending Request Notice */}
        {pendingRequest && (
          <div className="host-pending-notice">
            <span className="pending-icon">⏳</span>
            <div>
              <strong>Your request is under review</strong>
              <p>You submitted a request for "{pendingRequest.propertyTitle}" on {new Date(pendingRequest.createdAt).toLocaleDateString('en-IN')}. We'll notify you once it's reviewed.</p>
            </div>
          </div>
        )}

        {/* Previous Requests */}
        {existingRequests.length > 0 && (
          <div className="host-requests-section">
            <h3>Your Requests</h3>
            <div className="host-requests-list">
              {existingRequests.map((req) => (
                <div key={req._id} className={`host-request-item status-bg-${req.status}`}>
                  <div className="request-info">
                    <strong>{req.propertyTitle}</strong>
                    <small>{req.location?.city}, {req.location?.country} · {req.propertyType}</small>
                  </div>
                  <div className="request-meta">
                    <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    <small>{new Date(req.createdAt).toLocaleDateString('en-IN')}</small>
                  </div>
                  {req.status === 'rejected' && req.adminNote && (
                    <p className="request-note">Admin: {req.adminNote}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-step Form */}
        {!pendingRequest && (
          <div className="host-form-container">
            {/* Progress */}
            <div className="step-progress">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>
                  <span>{s}</span>
                  <small>{['Property', 'Location', 'Details', 'Review'][s - 1]}</small>
                </div>
              ))}
              <div className="step-line">
                <div className="step-line-fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
              </div>
            </div>

            {/* Step 1: Property */}
            {step === 1 && (
              <div className="host-step fade-in">
                <h2>Tell us about your property</h2>
                <div className="form-group">
                  <label>Property Name *</label>
                  <input className="form-control" value={form.propertyTitle} onChange={(e) => updateForm('propertyTitle', e.target.value)} placeholder="e.g. Sunset Beach Villa" />
                </div>
                <div className="form-group">
                  <label>Property Type *</label>
                  <div className="property-type-grid">
                    {PROPERTY_TYPES.map((type) => (
                      <button key={type} type="button" className={`type-card ${form.propertyType === type ? 'active' : ''}`} onClick={() => updateForm('propertyType', type)}>
                        <span className="type-icon">
                          {type === 'Hotel' && '🏨'}{type === 'Villa' && '🏡'}{type === 'Apartment' && '🏢'}
                          {type === 'Cottage' && '🛖'}{type === 'Resort' && '🌴'}{type === 'Homestay' && '🏠'}
                          {type === 'Hostel' && '🛏️'}{type === 'Other' && '🏗️'}
                        </span>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" rows="4" value={form.propertyDescription} onChange={(e) => updateForm('propertyDescription', e.target.value)} placeholder="Describe your property, what makes it unique, the experience guests will have..." />
                </div>
              </div>
            )}

            {/* Step 2: Location & Pricing */}
            {step === 2 && (
              <div className="host-step fade-in">
                <h2>Location & Pricing</h2>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>City *</label>
                    <input className="form-control" value={form['location.city']} onChange={(e) => updateForm('location.city', e.target.value)} placeholder="e.g. Goa" />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input className="form-control" value={form['location.state']} onChange={(e) => updateForm('location.state', e.target.value)} placeholder="e.g. Goa" />
                  </div>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Country *</label>
                    <input className="form-control" value={form['location.country']} onChange={(e) => updateForm('location.country', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Full Address</label>
                    <input className="form-control" value={form['location.address']} onChange={(e) => updateForm('location.address', e.target.value)} placeholder="Street address (optional)" />
                  </div>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Price per Night (₹) *</label>
                    <input className="form-control" type="number" min="1" value={form.price} onChange={(e) => updateForm('price', e.target.value)} placeholder="e.g. 2500" />
                  </div>
                  <div className="form-group">
                    <label>Max Guests *</label>
                    <input className="form-control" type="number" min="1" max="50" value={form.maxGuests} onChange={(e) => updateForm('maxGuests', e.target.value)} placeholder="e.g. 4" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="host-step fade-in">
                <h2>Amenities & Contact</h2>
                <div className="form-group">
                  <label>Amenities (select all that apply)</label>
                  <div className="amenity-select-grid">
                    {AMENITY_OPTIONS.map((amenity) => (
                      <button key={amenity} type="button" className={`amenity-btn ${form.amenities.includes(amenity) ? 'active' : ''}`} onClick={() => toggleAmenity(amenity)}>
                        ✓ {amenity}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URLs (comma-separated)</label>
                  <textarea className="form-control" rows="2" value={form.images} onChange={(e) => updateForm('images', e.target.value)} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input className="form-control" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message to Admin (optional)</label>
                  <textarea className="form-control" rows="2" value={form.message} onChange={(e) => updateForm('message', e.target.value)} placeholder="Anything else you'd like us to know..." />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="host-step fade-in">
                <h2>Review your request</h2>
                <div className="review-summary">
                  <div className="review-row"><span>Property</span><strong>{form.propertyTitle}</strong></div>
                  <div className="review-row"><span>Type</span><strong>{form.propertyType}</strong></div>
                  <div className="review-row"><span>Location</span><strong>{form['location.city']}, {form['location.state'] && `${form['location.state']}, `}{form['location.country']}</strong></div>
                  <div className="review-row"><span>Price</span><strong>₹{Number(form.price).toLocaleString()} / night</strong></div>
                  <div className="review-row"><span>Max Guests</span><strong>{form.maxGuests}</strong></div>
                  <div className="review-row"><span>Amenities</span><strong>{form.amenities.join(', ') || 'None'}</strong></div>
                  <div className="review-row"><span>Phone</span><strong>{form.phone}</strong></div>
                  <div className="review-row"><span>Images</span><strong>{form.images.split(',').filter(Boolean).length} image(s)</strong></div>
                </div>
                <p className="review-note">
                  By submitting, your request will be reviewed by our team. Once approved, your property will be listed and you'll be upgraded to a Host account.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="host-form-actions">
              {step > 1 && (
                <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>← Back</button>
              )}
              <div style={{ flex: 1 }} />
              {step < 4 ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Next →
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : '🚀 Submit Request'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
