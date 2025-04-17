'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { register, clearError, loadUser } from '@/redux/slices/authSlice';
import styles from '../login/auth.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const { isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Load user data if token exists
      dispatch(loadUser())
        .unwrap()
        .then(() => {
          router.push('/movies');
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('token');
        });
    }

    // Reset errors when component mounts or unmounts
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, router]);

  useEffect(() => {
    // If already authenticated, redirect to movies page
    if (isAuthenticated) {
      router.push('/movies');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      const { username, email, password } = formData;
      dispatch(register({ username, email, password }));
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Register</h1>
        <p className={styles.authSubtitle}>
          Create an account to manage your movie collection
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={
                submitted && validationErrors.username ? styles.inputError : ''
              }
              placeholder="Enter a username"
            />
            {submitted && validationErrors.username && (
              <span className={styles.errorText}>
                {validationErrors.username}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={
                submitted && validationErrors.email ? styles.inputError : ''
              }
              placeholder="Enter your email"
            />
            {submitted && validationErrors.email && (
              <span className={styles.errorText}>{validationErrors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={
                submitted && validationErrors.password ? styles.inputError : ''
              }
              placeholder="Create a password"
            />
            {submitted && validationErrors.password && (
              <span className={styles.errorText}>
                {validationErrors.password}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={
                submitted && validationErrors.confirmPassword
                  ? styles.inputError
                  : ''
              }
              placeholder="Confirm your password"
            />
            {submitted && validationErrors.confirmPassword && (
              <span className={styles.errorText}>
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className={styles.authLink}>
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
} 