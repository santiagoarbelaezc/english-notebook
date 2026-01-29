import React from 'react';
import { RegisterForm } from '../../components/auth/RegisterForm';

const Register: React.FC = () => {
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
      <RegisterForm />
    </div>
  );
};

export default Register;