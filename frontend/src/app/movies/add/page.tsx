'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { createMovie, clearError } from '@/redux/slices/movieSlice';
import { loadUser } from '@/redux/slices/authSlice';
import Navbar from '@/components/Navbar';
import MovieForm from '@/components/MovieForm';
import type { Movie } from '@/types/movie';
import styles from './add.module.css';

export default function AddMovie() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading, error } = useSelector((state: RootState) => state.movies);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Load user on component mount
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // If not authenticated, redirect to login page
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (movieData: Movie) => {
    setLocalError(null);
    
    dispatch(createMovie(movieData))
      .unwrap()
      .then(() => {
        router.push('/movies');
      })
      .catch((err) => {
        console.error('Failed to create movie:', err);
        setLocalError(typeof err === 'string' ? err : 'Failed to create movie. Please try again.');
      });
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {localError && (
          <div className={styles.error}>
            {localError}
            <button 
              onClick={() => setLocalError(null)} 
              className={styles.dismissButton}
            >
              Dismiss
            </button>
          </div>
        )}
        <div className={styles.header}>
          <h1>Add New Movie</h1>
          <Link href="/movies" passHref>
            <button className={styles.backButton}>
              Back to Movies
            </button>
          </Link>
        </div>
        <MovieForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error || localError}
          formType="add"
        />
      </div>
    </>
  );
} 