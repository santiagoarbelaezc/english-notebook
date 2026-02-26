import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useForm } from '../../../hooks/useForm';
import type { ChangeEvent, FormEvent } from 'react';
import styles from './LoginForm.module.css';
import huskyVideo from '../../../assets/videos/video-husky.mp4';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});

  const { values, handleChange } = useForm<LoginFormData>({
    email: '',
    password: ''
  });

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(values);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  return (
    <div className={styles.container}>
      {/* Right Section - Header con logo y título */}
      <div className={styles.rightSection}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <video
              src={huskyVideo}
              className={styles.logoVideo}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          <h1 className={styles.mainTitle}>English Notebook</h1>
          <p className={styles.subtitle}>Your Personal Learning Companion</p>
          <div className={styles.creditsSection}>
            <p className={styles.creditsTitle}>Creator</p>
            <p className={styles.creditsText}>Made by: Santiago Arbelaez Contreras</p>
            <p className={styles.creditsYear}>© 2026</p>
          </div>
        </div>
      </div>

      {/* Left Section - Form */}
      <div className={styles.leftSection}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Welcome back to your learning journey</p>
        </div>

        {authError && <div className={styles.globalError}>{authError}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className={styles.input}
              placeholder="your@email.com"
              value={values.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <span className={styles.error}>{validationErrors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              value={values.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {validationErrors.password && (
              <span className={styles.error}>{validationErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider} />

        <div className={styles.footer}>
          Don't have an account?{' '}
          <a className={styles.link} onClick={onSwitchToRegister}>
            Create one now
          </a>
        </div>

        <div className={styles.bottomNote}>
          <p>Start your English learning journey today</p>
        </div>
      </div>
    </div>
  );
};