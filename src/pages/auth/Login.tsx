import React, { useState } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import { RegisterForm } from '../../components/auth/RegisterForm';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

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

      {/* Contenido principal con transición */}
      <div
        style={{
          width: '100%',
          maxWidth: '1300px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            opacity: isRegister ? 0 : 1,
            transform: isRegister ? 'translateX(-20px)' : 'translateX(0)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isRegister ? 'none' : 'auto',
            position: isRegister ? 'absolute' : 'relative',
            width: '100%'
          }}
        >
          <LoginForm onSwitchToRegister={() => setIsRegister(true)} />
        </div>

        <div
          style={{
            opacity: isRegister ? 1 : 0,
            transform: isRegister ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isRegister ? 'auto' : 'none',
            position: isRegister ? 'relative' : 'absolute',
            width: '100%'
          }}
        >
          <RegisterForm onSwitchToLogin={() => setIsRegister(false)} />
        </div>
      </div>
    </div>
  );
};

export default Login;
