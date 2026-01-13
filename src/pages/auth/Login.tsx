import React from 'react';
import { LoginForm } from '../../components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div
      style={{
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
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      {/* Contenido principal */}
      <LoginForm />
    </div>
  );
};

export default Login;
