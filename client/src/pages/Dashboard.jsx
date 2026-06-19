import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PasswordGenerator from '../components/PasswordGenerator';
import AITools from '../components/AITools';

const Dashboard = () => {
  const { user, logout, updateUserProfile, deleteAccount } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('vault'); // 'vault', 'dashboard', 'profile', 'generator', 'ai', 'activity'
  const [accounts, setAccounts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state (Add/Edit accounts are still modals, profile details is direct or modal)
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState(null);
  
  // Profile form state (used directly in the profile tab)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone_number: '',
    email_address: '',
    username: '',
    password: ''
  });

  // Account form state
  const [accountForm, setAccountForm] = useState({
    account_name: '',
    username: '',
    password: '',
    link: '',
    description: ''
  });

  // Standalone Generator password state
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Password visibility mapping: { [accountId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch user's accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/accounts');
      setAccounts(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch accounts', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const { data } = await axios.get('/api/activities');
      setActivities(data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to fetch activity logs', 'danger');
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch activities whenever activity tab is opened
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab]);

  // Initialize Profile Form
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone_number: user.phone_number || '',
        email_address: user.email_address || '',
        username: user.username || '',
        password: ''
      });
    }
  }, [user, activeTab]);

  // Toggle password visibility
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy password to clipboard
  const copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    addToast('Password copied to clipboard!', 'success');
  };

  // Search filter for vault
  const filteredAccounts = accounts.filter(acc => 
    acc.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add Account Submit
  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.account_name || !accountForm.username || !accountForm.password) {
      addToast('Account Name, Username, and Password are required', 'warning');
      return;
    }
    try {
      const { data } = await axios.post('/api/accounts', accountForm);
      setAccounts(prev => [...prev, data]);
      setAddOpen(false);
      setAccountForm({ account_name: '', username: '', password: '', link: '', description: '' });
      addToast('Account credential added successfully', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add account', 'danger');
    }
  };

  // Edit Account Open
  const openEditModal = (account) => {
    setActiveAccount(account);
    setAccountForm({
      account_name: account.account_name,
      username: account.username,
      password: account.password,
      link: account.link,
      description: account.description
    });
    setEditOpen(true);
  };

  // Edit Account Submit
  const handleEditAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.account_name || !accountForm.username || !accountForm.password) {
      addToast('Account Name, Username, and Password are required', 'warning');
      return;
    }
    try {
      const { data } = await axios.put(`/api/accounts/${activeAccount._id}`, accountForm);
      setAccounts(prev => prev.map(acc => acc._id === activeAccount._id ? data : acc));
      setEditOpen(false);
      setActiveAccount(null);
      addToast('Account credential updated successfully', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update account', 'danger');
    }
  };

  // Delete Account
  const handleDeleteAccount = async (id) => {
    if (window.confirm('Do you want to delete this account?')) {
      try {
        await axios.delete(`/api/accounts/${id}`);
        setAccounts(prev => prev.filter(acc => acc._id !== id));
        addToast('Account deleted successfully', 'success');
      } catch (error) {
        addToast(error.response?.data?.message || 'Failed to delete account', 'danger');
      }
    }
  };

  // Update Profile Submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updateData = { ...profileForm };
    if (!updateData.password) delete updateData.password; // don't send empty password

    const res = await updateUserProfile(updateData);
    if (res.success) {
      addToast('Profile details updated successfully!', 'success');
    } else {
      addToast(res.message, 'danger');
    }
  };

  // Delete User Profile
  const handleDeleteUserProfile = async () => {
    if (window.confirm('Do you want to delete your user account? The registered credentials under this account will also be permanently deleted.')) {
      const res = await deleteAccount();
      if (res.success) {
        addToast('Your profile and all passwords have been deleted.', 'success');
      } else {
        addToast(res.message, 'danger');
      }
    }
  };

  // Standalone password generator generate action
  const triggerStandaloneGenerator = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
    addToast('New password generated!', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="glass" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 30px',
        margin: '20px 30px',
        borderRadius: '12px',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('vault')}
          style={{ 
            fontSize: '1.2rem', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer' 
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>🔐</span>
          Secure Password Management System
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('vault')} 
            className="btn" 
            style={{ 
              background: activeTab === 'vault' ? 'var(--primary-gradient)' : 'none',
              color: activeTab === 'vault' ? 'var(--text-dark)' : 'var(--text-main)',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-vault"></i> Home
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="btn" 
            style={{ 
              background: activeTab === 'dashboard' ? 'var(--primary-gradient)' : 'none',
              color: activeTab === 'dashboard' ? 'var(--text-dark)' : 'var(--text-main)',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-chart-column"></i> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className="btn" 
            style={{ 
              background: activeTab === 'profile' ? 'var(--primary-gradient)' : 'none',
              color: activeTab === 'profile' ? 'var(--text-dark)' : 'var(--text-main)',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-user"></i> Profile
          </button>
          <button 
            onClick={() => setActiveTab('generator')} 
            className="btn" 
            style={{ 
              background: activeTab === 'generator' ? 'var(--primary-gradient)' : 'none',
              color: activeTab === 'generator' ? 'var(--text-dark)' : 'var(--text-main)',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-key"></i> Password Generator
          </button>
          <button 
            onClick={() => setActiveTab('ai')} 
            className="btn" 
            style={{ 
              background: activeTab === 'ai' ? 'var(--primary-gradient)' : 'none',
              color: activeTab === 'ai' ? 'var(--text-dark)' : 'var(--text-main)',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-robot"></i> AI Security Lab
          </button>
          <button 
            onClick={() => setActiveTab('activity')} 
            className="btn" 
            style={{ 
              background: activeTab === 'activity' ? 'var(--primary-gradient)' : 'none',
              color: activeTab === 'activity' ? 'var(--text-dark)' : 'var(--text-main)',
              padding: '8px 16px',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-clipboard-list"></i> Activity Log
          </button>
        </div>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Welcome, {user?.name || 'User'} <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
          </button>
          
          {dropdownOpen && (
            <div className="glass" style={{
              position: 'absolute',
              right: 0,
              top: '45px',
              width: '180px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <button 
                onClick={() => { setActiveTab('profile'); setDropdownOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                <i className="fa-solid fa-user-gear"></i> View Account
              </button>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <button 
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '0 30px 30px 30px', display: 'flex', justifyContent: 'center' }}>
        
        {/* Tab 1: Vault (Default / Home list) */}
        {activeTab === 'vault' && (
          <div className="glass animate-fade-in" style={{ width: '100%', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 600, textAlign: 'center', marginBottom: '20px' }}>
              {user?.name}'s Accounts
            </h4>

            {/* Search and Add Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔎 Search Account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
                ➕ Add Account
              </button>
            </div>

            {/* Accounts Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                <p>Loading credentials...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-vault" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                <p>No accounts found.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>Serial</th>
                      <th>Account Name</th>
                      <th>Username</th>
                      <th style={{ width: '220px' }}>Password</th>
                      <th>URL</th>
                      <th>Description</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc, index) => {
                      const isVisible = !!visiblePasswords[acc._id];
                      return (
                        <tr key={acc._id}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td style={{ fontWeight: 600 }}>{acc.account_name}</td>
                          <td>{acc.username}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type={isVisible ? 'text' : 'password'}
                                value={acc.password}
                                readOnly
                                className="form-control"
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: 0,
                                  fontSize: isVisible ? '0.95rem' : '1.25rem',
                                  color: 'var(--text-main)',
                                  boxShadow: 'none',
                                  width: '120px',
                                  letterSpacing: isVisible ? 'normal' : '3px'
                                }}
                              />
                              <button className="btn-icon" onClick={() => togglePasswordVisibility(acc._id)}>
                                <i className={`fa-solid ${isVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                              </button>
                              <button className="btn-icon" onClick={() => copyPassword(acc.password)}>
                                <i className="fa-solid fa-copy"></i>
                              </button>
                            </div>
                          </td>
                          <td>
                            {acc.link ? (
                              <a href={acc.link.startsWith('http') ? acc.link : `https://${acc.link}`} target="_blank" rel="noopener noreferrer">
                                {acc.link}
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                            )}
                          </td>
                          <td>{acc.description || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <button className="btn-icon" onClick={() => openEditModal(acc)} style={{ color: 'var(--primary)' }}>
                                <i className="fa-solid fa-pencil"></i>
                              </button>
                              <button className="btn-icon" onClick={() => handleDeleteAccount(acc._id)} style={{ color: 'var(--danger)' }}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dashboard Statistics (corresponds to dashboard.php) */}
        {activeTab === 'dashboard' && (
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '900px', padding: '30px', textAlign: 'center', alignSelf: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              📊 Dashboard
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>Quick Stats Summary</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {/* Total Saved Accounts Card */}
              <div className="glass" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                padding: '24px',
                width: '240px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fa-solid fa-key" style={{ fontSize: '2.5rem', color: '#a78bfa' }}></i>
                <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>{accounts.length}</h1>
                <p style={{ fontSize: '0.95rem', color: '#c084fc', fontWeight: 500 }}>Total Saved Accounts</p>
              </div>

              {/* Secure Card */}
              <div className="glass" style={{
                background: 'linear-gradient(135deg, rgba(0, 247, 255, 0.2), rgba(0, 247, 255, 0.05))',
                borderColor: 'rgba(0, 247, 255, 0.3)',
                padding: '24px',
                width: '240px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>Secure</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 500 }}>Password Encryption</p>
              </div>

              {/* Active Card */}
              <div className="glass" style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                padding: '24px',
                width: '240px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fa-solid fa-user-check" style={{ fontSize: '2.5rem', color: '#f87171' }}></i>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>Active</h1>
                <p style={{ fontSize: '0.95rem', color: '#f87171', fontWeight: 500 }}>User Session</p>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => setActiveTab('vault')}>
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </button>
          </div>
        )}

        {/* Tab 3: Profile Settings (corresponds to View account modal edits) */}
        {activeTab === 'profile' && (
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '30px', alignSelf: 'center' }}>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 600, textAlign: 'center', marginBottom: '24px', color: 'var(--primary)' }}>
              👤 Profile Settings
            </h4>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.phone_number}
                  onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileForm.email_address}
                  onChange={(e) => setProfileForm({ ...profileForm, email_address: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new master password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-danger" onClick={handleDeleteUserProfile}>
                  <i className="fa-solid fa-user-xmark"></i> Delete Account
                </button>
                <div style={{ flex: 1 }}></div>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-floppy-disk"></i> Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Password Generator (corresponds to generator.php) */}
        {activeTab === 'generator' && (
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '35px', alignSelf: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              🔑 Password Generator
            </h3>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <input
                type="text"
                className="form-control"
                value={generatedPassword}
                readOnly
                placeholder="Click Generate to create a password"
                style={{
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  letterSpacing: '0.5px',
                  background: 'rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={triggerStandaloneGenerator} style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                Generate
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  if (generatedPassword) {
                    copyPassword(generatedPassword);
                  } else {
                    addToast('Generate a password first!', 'warning');
                  }
                }} 
                style={{
                  background: 'var(--success)',
                  color: 'var(--text-dark)',
                  padding: '12px 24px',
                  fontSize: '0.95rem'
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: AI Security Lab */}
        {activeTab === 'ai' && (
          <AITools addToast={addToast} />
        )}

        {/* Tab 6: Activity Log (corresponds to activity.php) */}
        {activeTab === 'activity' && (
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 600, textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              📋 Activity Log
            </h4>

            {activitiesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                <p>Fetching activity logs...</p>
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-list-check" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                <p>No activity logs recorded yet.</p>
              </div>
            ) : (
              <div className="table-container" style={{ maxHeight: '450px', overflowY: 'auto', marginBottom: '24px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '220px' }}>Date</th>
                      <th>Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((log) => {
                      const date = new Date(log.createdAt);
                      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                      return (
                        <tr key={log._id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formattedDate}</td>
                          <td style={{ fontWeight: 500 }}>{log.activity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setActiveTab('vault')}>
                Back Home
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal - Add Account */}
      {addOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'rgba(15, 23, 42, 0.95)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h5 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Account</h5>
              <button className="btn-icon" onClick={() => setAddOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddAccount}>
              <div className="input-group">
                <label className="input-label">Account Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Google, Facebook"
                  value={accountForm.account_name}
                  onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username or email address"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Website password"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                />
                <PasswordGenerator onGenerate={(pass) => setAccountForm(prev => ({ ...prev, password: pass }))} />
              </div>

              <div className="input-group">
                <label className="input-label">Link (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. accounts.google.com"
                  value={accountForm.link}
                  onChange={(e) => setAccountForm({ ...accountForm, link: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter details or notes..."
                  value={accountForm.description}
                  onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edit Account */}
      {editOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'rgba(15, 23, 42, 0.95)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h5 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Update Account</h5>
              <button className="btn-icon" onClick={() => setEditOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleEditAccount}>
              <div className="input-group">
                <label className="input-label">Account Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={accountForm.account_name}
                  onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="text"
                  className="form-control"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                />
                <PasswordGenerator onGenerate={(pass) => setAccountForm(prev => ({ ...prev, password: pass }))} />
              </div>

              <div className="input-group">
                <label className="input-label">Link (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  value={accountForm.link}
                  onChange={(e) => setAccountForm({ ...accountForm, link: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={accountForm.description}
                  onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
