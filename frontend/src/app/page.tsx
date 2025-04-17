'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { loadUser } from '@/redux/slices/authSlice';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Check if user is already authenticated
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Movie Collection</h1>
          <p className={styles.subtitle}>
            Keep track of your favorite movies in one place. Or just store cat pictures instead, pretending they&apos;re movies.
          </p>

          {isAuthenticated ? (
            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                onClick={() => router.push('/movies')}
              >
                View My Movies
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => router.push('/movies/add')}
              >
                Add New Movie
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <Link href="/login" className={styles.primaryButton}>
                Log In
              </Link>
              <Link href="/register" className={styles.secondaryButton}>
                Register
              </Link>
            </div>
          )}
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📋</div>
            <h2>Create Your Collection</h2>
            <p>
              Add your favorite movies to your personal collection. Keep track of
              titles, release years, and more.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⭐</div>
            <h2>Rate & Review</h2>
            <p>
              Rate movies on a scale of 1-10 and add descriptions to remember
              what you loved (or didn&apos;t love) about each film.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h2>Search & Filter</h2>
            <p>
              Easily find movies in your collection with powerful search and
              filtering options. Sort by title, year, or rating.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
