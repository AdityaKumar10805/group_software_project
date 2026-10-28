import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineQrCode, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <HiOutlineQrCode />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to Smart QR Attendance System</p>
        </div>

        {error && (
          <div className="login-error" style={{ marginBottom: 18 }}>
            <span>{error}</span>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
              Tip: Use the pre-configured Demo credentials below.
            </div>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <HiOutlineEnvelope style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@smartqr.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              id="login-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <HiOutlineLockClosed style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit">
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Quick Demo Logins
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('admin@smartqr.edu', 'admin123')}
              id="quick-fill-admin"
            >
              👑 Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('priya@smartqr.edu', 'teacher123')}
              id="quick-fill-teacher"
            >
              👩‍🏫 Fill Teacher
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
            Admin: <code>admin@smartqr.edu</code> / <code>admin123</code><br />
            Teacher: <code>priya@smartqr.edu</code> / <code>teacher123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
