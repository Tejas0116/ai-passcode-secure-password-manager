import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`glass animate-fade-in`}
            style={{
              padding: '12px 24px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 500,
              minWidth: '250px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: `4px solid ${
                toast.type === 'success' ? '#10b981' :
                toast.type === 'danger' ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
              }`,
              background: 'rgba(15, 23, 42, 0.9)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto'
            }}
          >
            <i className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check' :
              toast.type === 'danger' ? 'fa-circle-xmark' :
              toast.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'
            }`} style={{
              color: 
                toast.type === 'success' ? '#10b981' :
                toast.type === 'danger' ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
            }}></i>
            <div>{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
