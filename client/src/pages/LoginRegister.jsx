import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      addToast('Please enter username and password', 'warning');
      return;
    }
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      addToast('Welcome back! Login successful', 'success');
    } else {
      addToast(res.message, 'danger');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber || !emailAddress || !username || !password) {
      addToast('All fields are required', 'warning');
      return;
    }
    setLoading(true);
    const res = await register({
      name,
      phone_number: phoneNumber,
      email_address: emailAddress,
      username,
      password
    });
    setLoading(false);
    if (res.success) {
      addToast('Account created successfully!', 'success');
    } else {
      addToast(res.message, 'danger');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <i className="fa-solid fa-user-lock" style={{
            fontSize: '3.5rem',
            color: 'var(--primary)',
            filter: 'drop-shadow(0 0 8px rgba(0, 247, 255, 0.4))',
            marginBottom: '16px'
          }}></i>
          <h2 style={{ fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
            Password Manager
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            MERN Secure Vault
          </p>
        </div>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <h4 style={{ marginBottom: '24px', fontWeight: 600, color: 'var(--primary)' }}>
              — Login —
            </h4>
            
            <div className="input-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span 
                onClick={() => setIsLogin(false)}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  marginTop: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--primary-hover)'}
                onMouseOut={(e) => e.target.style.color = 'var(--primary)'}
              >
                No account? Register Here!
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <h4 style={{ marginBottom: '24px', fontWeight: 600, color: 'var(--primary)' }}>
              — Registration —
            </h4>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-name">Name</label>
              <input
                type="text"
                id="reg-name"
                className="form-control"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-phone">Phone Number</label>
              <input
                type="text"
                id="reg-phone"
                className="form-control"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-email">Email Address</label>
              <input
                type="email"
                id="reg-email"
                className="form-control"
                placeholder="Enter email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-username">Username</label>
              <input
                type="text"
                id="reg-username"
                className="form-control"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                className="form-control"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span 
                onClick={() => setIsLogin(true)}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  marginTop: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--primary-hover)'}
                onMouseOut={(e) => e.target.style.color = 'var(--primary)'}
              >
                Already have an account? Log in here!
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
