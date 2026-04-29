import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function HostLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      const role = data.data?.role;
      if (role !== 'host' && role !== 'admin') {
        setError('This login is for hosts only. Please use the user login page.');
        toast.error('This account is not a host account');
        return;
      }
      toast.success('Welcome back, Host!');
      navigate('/host-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card auth-card-host slide-up">
        <div className="auth-badge-host">🏠 HOST PORTAL</div>
        <div className="auth-header">
          <h1>Host Sign In</h1>
          <p>Manage your properties on Tripzybnb</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="host-email">Email</label>
            <input
              id="host-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your host email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="host-password">Password</label>
            <input
              id="host-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-host btn-lg auth-submit" disabled={loading} id="host-login-submit">
            {loading ? 'Signing in...' : 'Sign in as Host'}
          </button>
        </form>

        <p className="auth-footer">
          Want to become a host? <Link to="/host/register">Register as Host</Link>
        </p>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-footer" style={{ marginTop: 0 }}>
          <Link to="/login" className="auth-switch-link">← Sign in as a Guest instead</Link>
        </p>
      </div>
    </div>
  );
}
