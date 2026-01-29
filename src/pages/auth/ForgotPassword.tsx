import React from 'react';

const ForgotPassword: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-dark)',
      fontFamily: 'var(--font-primary)',
      position: 'relative',
      overflow: 'hidden',
      padding: 'var(--spacing-lg)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Forgot Password</h2>
        <p style={{ color: 'white' }}>This feature is not implemented yet.</p>
      </div>
    </div>
  );
};

export default ForgotPassword;