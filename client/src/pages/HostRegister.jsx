import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function HostRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerHost } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerHost({ name, email, password, phone });
      toast.success('Host account created! Welcome aboard! 🎉');
      navigate('/host-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card auth-card-host slide-up">
        <div className="auth-badge-host">🏠 HOST PORTAL</div>
        <div className="auth-header">
          <h1>Become a Host</h1>
          <p>Register to list your properties on Tripzybnb</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="host-reg-name">Full Name</label>
            <input
              id="host-reg-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="host-reg-email">Email</label>
            <input
              id="host-reg-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="host-reg-phone">Phone Number</label>
            <input
              id="host-reg-phone"
              type="tel"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="host-reg-password">Password</label>
            <input
              id="host-reg-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-host btn-lg auth-submit" disabled={loading} id="host-register-submit">
            {loading ? 'Creating account...' : 'Register as Host'}
          </button>
        </form>

        <p className="auth-footer">
          Already a host? <Link to="/host/login">Sign in</Link>
        </p>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-footer" style={{ marginTop: 0 }}>
          <Link to="/register" className="auth-switch-link">← Register as a Guest instead</Link>
        </p>
      </div>
    </div>
  );
}
