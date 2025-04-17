'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchMovie, clearSelectedMovie, deleteMovie } from '@/redux/slices/movieSlice';
import { loadUser } from '@/redux/slices/authSlice';
import Navbar from '@/components/Navbar';
import styles from './movie.module.css';
import { use } from 'react';

export default function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const movieId = parseInt(id, 10);
  
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
      dispatch(deleteMovie(movieId))
        .unwrap()
        .then(() => {
          router.push('/movies');
        });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Loading movie details...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
          <Link href="/movies" passHref>
            <button className={styles.backButton}>
              Back to Movies
            </button>
          </Link>
        </div>
      </>
    );
  }

  if (!selectedMovie) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h2>Movie not found</h2>
            <p>The movie you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            <Link href="/movies" passHref>
              <button className={styles.backButton}>
                Back to Movies
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <Link href="/movies" passHref>
          <button className={styles.backButton}>
            Back to Movies
          </button>
        </Link>
        
        <div className={styles.header}>
          <h1 className={styles.title}>Movie Details</h1>
          <div className={styles.actions}>
            <Link href={`/movies/${movieId}/edit`} passHref>
              <button className={`${styles.actionButton} ${styles.editButton}`}>
                Edit
              </button>
            </Link>
            <button 
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className={styles.movieDetails}>
          <div className={styles.posterContainer}>
            {selectedMovie.posterUrl ? (
              <img 
                src={selectedMovie.posterUrl} 
                alt={`${selectedMovie.title} poster`} 
                className={styles.poster}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image+Available';
                }}
              />
            ) : (
              <div className={styles.noPoster}>No Poster Available</div>
            )}
          </div>
          
          <div className={styles.info}>
            <div className={styles.infoHeader}>
              <h2 className={styles.movieTitle}>{selectedMovie.title}</h2>
              {selectedMovie.rating !== undefined && (
                <div className={styles.rating}>
                  {selectedMovie.rating} <span className={styles.ratingIcon}>★</span>
                </div>
              )}
            </div>
            
            <div className={styles.infoGrid}>
              {selectedMovie.director && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Director</span>
                  <span className={styles.value}>{selectedMovie.director}</span>
                </div>
              )}
              
              {selectedMovie.releaseYear && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Release Year</span>
                  <span className={styles.value}>{selectedMovie.releaseYear}</span>
                </div>
              )}
              
              {selectedMovie.genre && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Genre</span>
                  <span className={styles.value}>{selectedMovie.genre}</span>
                </div>
              )}
            </div>
            
            {selectedMovie.description && (
              <div className={styles.description}>
                <h3 className={styles.descriptionLabel}>Description</h3>
                <p>{selectedMovie.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 