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

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <HiOutlineEnvelope style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
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

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Demo Credentials</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Admin: admin@smartqr.edu / admin123
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Teacher: priya@smartqr.edu / teacher123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
