'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { login, clearError, loadUser } from '@/redux/slices/authSlice';
import styles from './auth.module.css';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    // Basic validation
    if (!formData.username || !formData.password) {
      return;
    }

    dispatch(login(formData));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Log In</h1>
        <p className={styles.authSubtitle}>
          Login to access your movie collection
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
                submitted && !formData.username ? styles.inputError : ''
              }
              placeholder="Enter your username"
            />
            {submitted && !formData.username && (
              <span className={styles.errorText}>Username is required</span>
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
                submitted && !formData.password ? styles.inputError : ''
              }
              placeholder="Enter your password"
            />
            {submitted && !formData.password && (
              <span className={styles.errorText}>Password is required</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles.authLink}>
          Don&apos;t have an account?{' '}
          <Link href="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
} 