import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createListing } from '../api';
import './BecomeHost.css'; /* reuse the step form styles */

const PROPERTY_TYPES = ['Hotel', 'Villa', 'Apartment', 'Cottage', 'Resort', 'Homestay', 'Hostel', 'Other'];
const AMENITY_OPTIONS = ['WiFi', 'AC', 'Pool', 'Parking', 'Kitchen', 'Gym', 'Spa', 'Restaurant', 'Beach Access', 'Room Service', 'Laundry', 'TV', 'Hot Water', 'Power Backup', 'Garden'];

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: '',
    'location.city': '',
    'location.state': '',
    'location.country': 'India',
    price: '',
    maxGuests: '',
    amenities: [],
    images: '',
    tags: '',
  });

  useEffect(() => {
    if (!user) { navigate('/host/login'); return; }
    if (user.role !== 'host' && user.role !== 'admin') {
      navigate('/');
      toast.error('Only hosts can add properties');
    }
  }, [user]);

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
        title: form.title,
        description: form.description,
        location: {
          city: form['location.city'],
          state: form['location.state'],
          country: form['location.country'],
        },
        price: Number(form.price),
        maxGuests: Number(form.maxGuests) || 6,
        amenities: form.amenities,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [form.propertyType.toLowerCase()],
      };
      await createListing(payload);
      toast.success('Property listed successfully! 🎉');
      navigate('/host-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.title && form.propertyType && form.description;
    if (step === 2) return form['location.city'] && form['location.country'] && form.price && form.maxGuests;
    if (step === 3) return true; // amenities/images optional
    return true;
  };

  return (
    <div className="page become-host-page">
      <div className="container">
        <div className="host-hero">
          <h1>Add New <span className="hero-accent">Property</span></h1>
          <p>List your property for travelers to discover and book</p>
        </div>

        <div className="host-form-container">
          {/* Progress */}
          <div className="step-progress">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>
                <span>{s}</span>
                <small>{['Property', 'Location', 'Amenities', 'Review'][s - 1]}</small>
              </div>
            ))}
            <div className="step-line">
              <div className="step-line-fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="host-step fade-in">
              <h2>Property Information</h2>
              <div className="form-group">
                <label>Property Name *</label>
                <input className="form-control" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g. Sunset Beach Villa" />
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
                <textarea className="form-control" rows="4" value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Describe your property..." />
              </div>
            </div>
          )}

          {/* Step 2 */}
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
                  <input className="form-control" value={form['location.state']} onChange={(e) => updateForm('location.state', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input className="form-control" value={form['location.country']} onChange={(e) => updateForm('location.country', e.target.value)} />
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

          {/* Step 3 */}
          {step === 3 && (
            <div className="host-step fade-in">
              <h2>Amenities & Images</h2>
              <div className="form-group">
                <label>Amenities</label>
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
              <div className="form-group">
                <label>Tags (comma-separated, optional)</label>
                <input className="form-control" value={form.tags} onChange={(e) => updateForm('tags', e.target.value)} placeholder="luxury, beach, family" />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="host-step fade-in">
              <h2>Review & Submit</h2>
              <div className="review-summary">
                <div className="review-row"><span>Property</span><strong>{form.title}</strong></div>
                <div className="review-row"><span>Type</span><strong>{form.propertyType}</strong></div>
                <div className="review-row"><span>Location</span><strong>{form['location.city']}, {form['location.state'] && `${form['location.state']}, `}{form['location.country']}</strong></div>
                <div className="review-row"><span>Price</span><strong>₹{Number(form.price).toLocaleString()} / night</strong></div>
                <div className="review-row"><span>Max Guests</span><strong>{form.maxGuests}</strong></div>
                <div className="review-row"><span>Amenities</span><strong>{form.amenities.join(', ') || 'None'}</strong></div>
                <div className="review-row"><span>Images</span><strong>{form.images.split(',').filter(Boolean).length} image(s)</strong></div>
              </div>
            </div>
          )}

          {/* Nav */}
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
                {loading ? 'Creating...' : '🚀 Publish Property'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
