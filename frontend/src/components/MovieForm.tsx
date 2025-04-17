'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './MovieForm.module.css';

interface Movie {
  id?: number;
  title: string;
  director?: string;
  releaseYear?: number;
  genre?: string;
  rating?: number;
  description?: string;
  posterUrl?: string;
}

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (movieData: Movie) => void;
  isLoading: boolean;
  error: string | null;
  formType: 'add' | 'edit';
}

export default function MovieForm({
  movie,
  onSubmit,
  isLoading,
  error,
  formType,
}: MovieFormProps) {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<Movie>({
    title: '',
    director: '',
    releaseYear: undefined,
    genre: '',
    rating: undefined,
    description: '',
    posterUrl: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Initialize form data with movie data if available (for editing)
  useEffect(() => {
    if (movie) {
      setFormData(movie);
    }
  }, [movie]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Title validation (required)
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      errors.title = 'Title must be 255 characters or less';
    }

    // Director validation (optional, but validate if provided)
    if (formData.director && formData.director.length > 100) {
      errors.director = 'Director name must be 100 characters or less';
    }

    // Release year validation (optional, but validate if provided)
    if (formData.releaseYear !== undefined) {
      if (isNaN(formData.releaseYear)) {
        errors.releaseYear = 'Release year must be a number';
      } else if (formData.releaseYear < 1880 || formData.releaseYear > currentYear + 5) {
        errors.releaseYear = `Release year must be between 1880 and ${currentYear + 5}`;
      }
    }

    // Genre validation (optional)
    if (formData.genre && formData.genre.length > 50) {
      errors.genre = 'Genre must be 50 characters or less';
    }

    // Rating validation (optional, but validate if provided)
    if (formData.rating !== undefined) {
      if (isNaN(formData.rating)) {
        errors.rating = 'Rating must be a number';
      } else if (formData.rating < 0 || formData.rating > 10) {
        errors.rating = 'Rating must be between 0 and 10';
      }
    }

    // Description validation (optional, but validate if provided)
    if (formData.description && formData.description.length > 2000) {
      errors.description = 'Description must be 2000 characters or less';
    }

    // Poster URL validation (optional, but validate if provided)
    if (formData.posterUrl) {
      try {
        new URL(formData.posterUrl);
      } catch {
        errors.posterUrl = 'Please enter a valid URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    if (name === 'releaseYear' || name === 'rating') {
      // Convert string to number for numeric fields, or undefined if empty
      const numValue = value.trim() === '' ? undefined : Number(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    // Validate the field when it loses focus
    const { name } = e.target;
    
    // Create a temporary object with just this field for validation
    const fieldToValidate: { [key: string]: unknown } = {};
    fieldToValidate[name] = formData[name as keyof Movie];
    
    // Perform field-specific validation
    const errors: { [key: string]: string } = {};
    
    switch (name) {
      case 'title':
        if (!formData.title.trim()) {
          errors.title = 'Title is required';
        } else if (formData.title.length > 255) {
          errors.title = 'Title must be 255 characters or less';
        }
        break;
      case 'director':
        if (formData.director && formData.director.length > 100) {
          errors.director = 'Director name must be 100 characters or less';
        }
        break;
      case 'releaseYear':
        if (formData.releaseYear !== undefined) {
          if (isNaN(formData.releaseYear)) {
            errors.releaseYear = 'Release year must be a number';
          } else if (formData.releaseYear < 1880 || formData.releaseYear > currentYear + 5) {
            errors.releaseYear = `Release year must be between 1880 and ${currentYear + 5}`;
          }
        }
        break;
      case 'rating':
        if (formData.rating !== undefined) {
          if (isNaN(formData.rating)) {
            errors.rating = 'Rating must be a number';
          } else if (formData.rating < 0 || formData.rating > 10) {
            errors.rating = 'Rating must be between 0 and 10';
          }
        }
        break;
      case 'posterUrl':
        if (formData.posterUrl) {
          try {
            new URL(formData.posterUrl);
          } catch {
            errors.posterUrl = 'Please enter a valid URL';
          }
        }
        break;
      default:
        break;
    }
    
    if (errors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent submission if already loading
    if (isLoading) return;
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleStarClick = (ratingValue: number) => {
    // Fix unused variable
    setFormData((prev) => ({ ...prev, rating: ratingValue }));
    
    // Clear validation error
    if (validationErrors.rating) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated.rating;
        return updated;
      });
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>
        {formType === 'add' ? 'Add New Movie' : 'Edit Movie'}
      </h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={validationErrors.title ? styles.inputError : ''}
            placeholder="Movie title"
          />
          {validationErrors.title && (
            <span className={styles.errorText}>{validationErrors.title}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="director">Director</label>
          <input
            type="text"
            id="director"
            name="director"
            value={formData.director || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Movie director"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="releaseYear">Release Year</label>
            <input
              type="number"
              id="releaseYear"
              name="releaseYear"
              value={formData.releaseYear || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={validationErrors.releaseYear ? styles.inputError : ''}
              placeholder="YYYY"
              min="1880"
              max={currentYear + 5}
            />
            {validationErrors.releaseYear && (
              <span className={styles.errorText}>
                {validationErrors.releaseYear}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              name="genre"
              value={formData.genre || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select a genre</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Animation">Animation</option>
              <option value="Comedy">Comedy</option>
              <option value="Crime">Crime</option>
              <option value="Documentary">Documentary</option>
              <option value="Drama">Drama</option>
              <option value="Family">Family</option>
              <option value="Fantasy">Fantasy</option>
              <option value="History">History</option>
              <option value="Horror">Horror</option>
              <option value="Music">Music</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Thriller">Thriller</option>
              <option value="War">War</option>
              <option value="Western">Western</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rating">Rating (0-10)</label>
            <div className={styles.ratingStars}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <span
                  key={value}
                  className={`${styles.star} ${
                    formData.rating !== undefined && formData.rating >= value
                      ? styles.starActive
                      : ''
                  }`}
                  onClick={() => handleStarClick(value)}
                >
                  ★
                </span>
              ))}
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={validationErrors.rating ? styles.inputError : ''}
                placeholder="0-10"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            {validationErrors.rating && (
              <span className={styles.errorText}>{validationErrors.rating}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Movie description"
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="posterUrl">Poster URL</label>
          <input
            type="text"
            id="posterUrl"
            name="posterUrl"
            value={formData.posterUrl || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={validationErrors.posterUrl ? styles.inputError : ''}
            placeholder="https://example.com/poster.jpg"
          />
          {validationErrors.posterUrl && (
            <span className={styles.errorText}>
              {validationErrors.posterUrl}
            </span>
          )}
        </div>

        {formData.posterUrl && (
          <div className={styles.posterPreview}>
            <p>Poster Preview:</p>
            <img
              src={formData.posterUrl}
              alt="Poster preview"
              className={styles.previewImage}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x450?text=Invalid+Image+URL';
              }}
            />
          </div>
        )}

        <div className={styles.formActions}>
          <Link href="/movies" passHref>
            <button
              type="button"
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingText}>
                <span className={styles.loadingDot}>•</span>
                <span className={styles.loadingDot}>•</span>
                <span className={styles.loadingDot}>•</span>
                Saving
              </span>
            ) : (
              formType === 'add' ? 'Add Movie' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 