import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useForm } from '../../../hooks/useForm';
import type { ChangeEvent, FormEvent } from 'react';
import styles from './RegisterForm.module.css';

interface RegisterFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  englishLevel: string;
}

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();
  const [validationErrors, setValidationErrors] = useState<Partial<RegisterFormData>>({});

  const { values, handleChange } = useForm<RegisterFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    englishLevel: 'A1'
  });

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {};

    if (!values.name) {
      errors.name = 'Name is required';
    } else if (values.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!values.username) {
      errors.username = 'Username is required';
    } else if (values.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-z0-9_-]+$/.test(values.username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

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

    if (!values.passwordConfirm) {
      errors.passwordConfirm = 'Please confirm your password';
    } else if (values.password !== values.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
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
      await register(values as any);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e);
  };

  return (
    <div className={styles.container}>
      {/* Right Section - Header con logo y título */}
      <div className={styles.rightSection}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img 
              src="/src/assets/icons/husky.png" 
              alt="English Notebook Logo" 
              className={styles.logo}
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
          <h2 className={styles.formTitle}>Create Account</h2>
          <p className={styles.formSubtitle}>Start your learning adventure</p>
        </div>

        {authError && <div className={styles.globalError}>{authError}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className={styles.input}
              placeholder="Your name"
              value={values.name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {validationErrors.name && (
              <span className={styles.error}>{validationErrors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              className={styles.input}
              placeholder="your_username"
              value={values.username}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {validationErrors.username && (
              <span className={styles.error}>{validationErrors.username}</span>
            )}
          </div>

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
            <label htmlFor="englishLevel" className={styles.label}>
              English Level
            </label>
            <select
              id="englishLevel"
              name="englishLevel"
              className={styles.select}
              value={values.englishLevel}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="A1">A1 - Beginner</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper Intermediate</option>
              <option value="C1">C1 - Advanced</option>
              <option value="C2">C2 - Mastery</option>
            </select>
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

          <div className={styles.formGroup}>
            <label htmlFor="passwordConfirm" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              name="passwordConfirm"
              className={styles.input}
              placeholder="••••••••"
              value={values.passwordConfirm}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {validationErrors.passwordConfirm && (
              <span className={styles.error}>{validationErrors.passwordConfirm}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider} />

        <div className={styles.footer}>
          Already have an account?{' '}
          <a className={styles.link} onClick={onSwitchToLogin}>
            Sign in here
          </a>
        </div>

        <div className={styles.bottomNote}>
          <p>Join thousands of learners worldwide</p>
        </div>
      </div>
    </div>
  );
};