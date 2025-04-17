'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchMovie, updateMovie, clearSelectedMovie } from '@/redux/slices/movieSlice';
import { loadUser } from '@/redux/slices/authSlice';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import MovieForm from '@/components/MovieForm';
import type { Movie } from '@/types/movie';
import styles from '../../add/add.module.css';

export default function EditMovie({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const movieId = parseInt(id, 10);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { selectedMovie, isLoading, error } = useSelector(
    (state: RootState) => state.movies
  );

  // Load user and movie data when component mounts
  useEffect(() => {
    dispatch(loadUser());
    dispatch(fetchMovie(movieId));
    
    // Clean up selected movie when leaving the page
    return () => {
      dispatch(clearSelectedMovie());
    };
  }, [dispatch, movieId]);

  // If not authenticated, redirect to login page
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (movieData: Movie) => {
    setSubmissionError(null);
    
    dispatch(updateMovie({ id: movieId, movieData }))
      .unwrap()
      .then(() => {
        router.push('/movies');
      })
      .catch((error) => {
        console.error('Failed to update movie:', error);
        setSubmissionError(typeof error === 'string' ? error : 'Failed to update movie. Please try again.');
      });
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {submissionError && (
          <div className={styles.error}>
            {submissionError}
            <button 
              onClick={() => setSubmissionError(null)} 
              className={styles.dismissButton}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {selectedMovie && (
          <MovieForm
            movie={selectedMovie}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error || submissionError}
            formType="edit"
          />
        )}
        {!selectedMovie && !isLoading && (
          <div className={styles.notFound}>
            <h2>Movie not found</h2>
            <p>The movie you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
            <Link href="/movies" passHref>
              <button className={styles.backButton}>
                Back to Movies
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
} 