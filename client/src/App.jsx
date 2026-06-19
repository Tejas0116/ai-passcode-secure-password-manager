import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'var(--text-muted)'
      }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '16px' }}></i>
        <h2>Verifying session...</h2>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginRegister />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
