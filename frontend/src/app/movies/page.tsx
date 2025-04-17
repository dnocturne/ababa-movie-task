'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  fetchMovies,
  fetchGenres,
  setSearchTerm,
  setSelectedGenre,
  setSortBy,
  setSortOrder,
  deleteMovie,
  resetFilters,
} from '@/redux/slices/movieSlice';
import { loadUser } from '@/redux/slices/authSlice';
import Navbar from '@/components/Navbar';
import styles from './movies.module.css';

export default function Movies() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    movies,
    isLoading,
    error,
    searchTerm,
    selectedGenre,
    allGenres,
    sortBy,
    sortOrder,
  } = useSelector((state: RootState) => state.movies);
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);

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

  // Load available genres
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchGenres());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch movies when component mounts or dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(
        fetchMovies({
          search: searchTerm,
          genre: selectedGenre,
          sortBy,
          order: sortOrder,
        })
      );
    }
  }, [
    dispatch,
    isAuthenticated,
    searchTerm,
    selectedGenre,
    sortBy,
    sortOrder,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSelectedGenre(e.target.value));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If already sorted by this column, toggle the order
      dispatch(setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      // Otherwise, sort by this column in ascending order
      dispatch(setSortBy(column));
      dispatch(setSortOrder('ASC'));
    }
  };

  const confirmDelete = (id: number) => {
    setMovieToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (movieToDelete) {
      dispatch(deleteMovie(movieToDelete))
        .unwrap()
        .then(() => {
          // Refresh movies after deletion
          dispatch(
            fetchMovies({
              search: searchTerm,
              genre: selectedGenre,
              sortBy,
              order: sortOrder,
            })
          );
        });
      setShowDeleteModal(false);
      setMovieToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Movie Collection</h1>
          <Link href="/movies/add" passHref>
            <button className={styles.addButton}>
              Add New Movie
            </button>
          </Link>
        </div>

        <div className={styles.filterControls}>
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />

          <select 
            value={selectedGenre} 
            onChange={handleGenreChange}
            className={styles.genreSelect}
          >
            <option value="">All Genres</option>
            {allGenres.map(genre => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          
          {(searchTerm || selectedGenre) && (
            <button 
              onClick={handleResetFilters}
              className={styles.resetButton}
              title="Clear all filters"
            >
              Reset
            </button>
          )}
        </div>

        <div className={styles.sortControls}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button
            className={`${styles.sortButton} ${sortBy === 'title' ? styles.activeSortButton : ''}`}
            onClick={() => handleSort('title')}
          >
            Title {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'releaseYear' ? styles.activeSortButton : ''}`}
            onClick={() => handleSort('releaseYear')}
          >
            Year {sortBy === 'releaseYear' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === 'rating' ? styles.activeSortButton : ''}`}
            onClick={() => handleSort('rating')}
          >
            Rating {sortBy === 'rating' && (sortOrder === 'ASC' ? '↑' : '↓')}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {isLoading ? (
          <div className={styles.loading}>Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No movies found.</p>
            {(searchTerm || selectedGenre) && (
              <p>
                Try clearing your filters or{' '}
                <Link href="/movies/add" passHref>
                  <button className={styles.textButton}>
                    add a new movie
                  </button>
                </Link>
              </p>
            )}
            {!searchTerm && !selectedGenre && (
              <Link href="/movies/add" passHref>
                <button className={styles.emptyStateButton}>
                  Add Your First Movie
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={styles.movieGrid}>
              {movies.map((movie) => (
                <div key={movie.id} className={styles.movieCard}>
                  <div className={styles.moviePoster}>
                    <img 
                      src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                      alt={`${movie.title} poster`}
                      className={styles.moviePosterImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster';
                      }}
                    />
                    <div className={styles.movieOverlay}>
                      <Link href={`/movies/${movie.id}`} passHref>
                        <button className={`${styles.actionButton} ${styles.viewButton}`}>
                          View
                        </button>
                      </Link>
                      <Link href={`/movies/${movie.id}/edit`} passHref>
                        <button className={`${styles.actionButton} ${styles.editButton}`}>
                          Edit
                        </button>
                      </Link>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => confirmDelete(movie.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className={styles.movieInfo}>
                    <h3 className={styles.movieTitle}>{movie.title}</h3>
                    <div className={styles.movieMeta}>
                      <div className={styles.movieMetaInfo}>
                        {movie.releaseYear && <span>{movie.releaseYear}</span>}
                        {movie.genre && movie.releaseYear ? <span> • </span> : null}
                        {movie.genre && <span>{movie.genre}</span>}
                      </div>
                      {movie.rating !== undefined && (
                        <div className={styles.movieRating}>
                          {movie.rating} <span className={styles.ratingIcon}>★</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete this movie?</p>
              <p>This action cannot be undone.</p>
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Link href="/movies/add">
        <button className={styles.fab} title="Add new movie">
          +
        </button>
      </Link>
    </>
  );
} 