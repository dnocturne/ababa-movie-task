import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Movie {
  id: number;
  title: string;
  director?: string;
  releaseYear?: number;
  genre?: string;
  rating?: number;
  description?: string;
  posterUrl?: string;
}

interface MovieState {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedGenre: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  selectedMovie: Movie | null;
  allGenres: string[];
}

interface FetchMoviesParams {
  search?: string;
  genre?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

// API base URL
const API_URL = 'http://localhost:3000';

// Helper function to safely access localStorage
const isBrowser = typeof window !== 'undefined';

// Helper to set auth header
const setAuthHeader = () => {
  if (!isBrowser) return;
  
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Async thunks
export const fetchMovies = createAsyncThunk<
  { movies: Movie[] },
  FetchMoviesParams
>('movies/fetchMovies', async (params, { rejectWithValue }) => {
  try {
    setAuthHeader();
    const { search, genre, sortBy, order } = params;
    let url = `${API_URL}/movies?getAllMovies=true`;
    if (search) url += `&search=${search}`;
    if (genre) url += `&genre=${genre}`;
    if (sortBy) url += `&sortBy=${sortBy}`;
    if (order) url += `&order=${order}`;

    const response = await axios.get(url);
    return { movies: response.data.movies || response.data };
  } catch (error: unknown) {
    const err = error as Error & { 
      response?: { 
        data?: { message?: string },
        status?: number 
      },
      request?: unknown 
    };
    return rejectWithValue(
      err.response?.data?.message || 'Failed to fetch movies'
    );
  }
});

// Fetch all available genres
export const fetchGenres = createAsyncThunk<string[]>(
  'movies/fetchGenres',
  async (_, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await axios.get(`${API_URL}/movies/genres`);
      return response.data;
    } catch (error: unknown) {
      const err = error as Error & { 
        response?: { 
          data?: { message?: string },
          status?: number 
        } 
      };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch genres'
      );
    }
  }
);

export const fetchMovie = createAsyncThunk<Movie, number>(
  'movies/fetchMovie',
  async (id, { rejectWithValue }) => {
    try {
      setAuthHeader();
      const response = await axios.get(`${API_URL}/movies/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as Error & { 
        response?: { 
          data?: { message?: string },
          status?: number 
        } 
      };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch movie'
      );
    }
  }
);

export const createMovie = createAsyncThunk<Movie, Partial<Movie>>(
  'movies/createMovie',
  async (movieData, { rejectWithValue }) => {
    try {
      // Validate required fields before sending request
      if (!movieData.title || !movieData.title.trim()) {
        return rejectWithValue('Movie title is required');
      }
      
      // Pre-process data
      const processedData = {
        ...movieData,
        title: movieData.title.trim(),
        // Ensure numeric fields are actual numbers
        releaseYear: movieData.releaseYear ? Number(movieData.releaseYear) : undefined,
        rating: movieData.rating ? Number(movieData.rating) : undefined,
      };
      
      setAuthHeader();
      const response = await axios.post(`${API_URL}/movies`, processedData);
      return response.data;
    } catch (error: unknown) {
      console.error('Movie creation error:', error);
      let errorMessage = 'Failed to create movie';
      
      const err = error as Error & { 
        response?: { 
          data?: { 
            message?: string, 
            error?: string,
            details?: Array<{ message: string }> | Record<string, unknown>
          },
          status?: number 
        },
        request?: unknown,
        message?: string
      };
      
      if (err.response) {
        // Server responded with an error
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
          
          // Include validation details if available
          if (err.response.data.details) {
            const details = Array.isArray(err.response.data.details) 
              ? err.response.data.details.map((d) => d.message).join(', ')
              : JSON.stringify(err.response.data.details);
            errorMessage += `: ${details}`;
          }
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unknown error occurred';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateMovie = createAsyncThunk<
  Movie,
  { id: number; movieData: Partial<Movie> }
>('movies/updateMovie', async ({ id, movieData }, { rejectWithValue }) => {
  try {
    if (!movieData.title || !movieData.title.trim()) {
      return rejectWithValue('Movie title is required');
    }
    
    // Pre-process data
    const processedData = {
      ...movieData,
      title: movieData.title.trim(),
      // Ensure numeric fields are actual numbers
      releaseYear: movieData.releaseYear ? Number(movieData.releaseYear) : undefined,
      rating: movieData.rating ? Number(movieData.rating) : undefined,
    };
    
    setAuthHeader();
    const response = await axios.put(`${API_URL}/movies/${id}`, processedData);
    return response.data;
  } catch (error: unknown) {
    let errorMessage = 'Failed to update movie';
    
    const err = error as Error & { 
      response?: { 
        data?: { 
          message?: string, 
          error?: string,
          details?: Array<{ message: string }> | Record<string, unknown>
        },
        status?: number 
      },
      request?: unknown,
      message?: string
    };
    
    if (err.response) {
      // Server responded with an error
      if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response.data?.error) {
        errorMessage = err.response.data.error;
        
        // Include validation details if available
        if (err.response.data.details) {
          const details = Array.isArray(err.response.data.details) 
            ? err.response.data.details.map((d) => d.message).join(', ')
            : JSON.stringify(err.response.data.details);
          errorMessage += `: ${details}`;
        }
      } else {
        errorMessage = `Server error: ${err.response.status}`;
      }
    } else if (err.request) {
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      errorMessage = err.message || 'An unknown error occurred';
    }
    
    return rejectWithValue(errorMessage);
  }
});

export const deleteMovie = createAsyncThunk<number, number>(
  'movies/deleteMovie',
  async (id, { rejectWithValue }) => {
    try {
      setAuthHeader();
      await axios.delete(`${API_URL}/movies/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as Error & { 
        response?: { 
          data?: { message?: string },
          status?: number 
        } 
      };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete movie'
      );
    }
  }
);

// Initial state
const initialState: MovieState = {
  movies: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedGenre: '',
  sortBy: 'id',
  sortOrder: 'ASC',
  selectedMovie: null,
  allGenres: [],
};

// Slice
const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedGenre: (state, action: PayloadAction<string>) => {
      state.selectedGenre = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'ASC' | 'DESC'>) => {
      state.sortOrder = action.payload;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.selectedGenre = '';
      state.sortBy = 'id';
      state.sortOrder = 'ASC';
    },
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Movies
      .addCase(fetchMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies = action.payload.movies;
        state.error = null;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Genres
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.allGenres = action.payload;
      })
      // Fetch Movie
      .addCase(fetchMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovie.fulfilled, (state, action: PayloadAction<Movie>) => {
        state.isLoading = false;
        state.selectedMovie = action.payload;
      })
      .addCase(fetchMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Movie
      .addCase(createMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMovie.fulfilled, (state) => {
        state.isLoading = false;
        // We'll refetch the movies list after creating
      })
      .addCase(createMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Movie
      .addCase(updateMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMovie.fulfilled, (state, action: PayloadAction<Movie>) => {
        state.isLoading = false;
        // Update the movie in the list
        const index = state.movies.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.movies[index] = action.payload;
        }
        // Update selected movie if it's the one being updated
        if (state.selectedMovie?.id === action.payload.id) {
          state.selectedMovie = action.payload;
        }
      })
      .addCase(updateMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Movie
      .addCase(deleteMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMovie.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        // Remove the movie from the list
        state.movies = state.movies.filter((m) => m.id !== action.payload);
        // Clear selected movie if it's the one being deleted
        if (state.selectedMovie?.id === action.payload) {
          state.selectedMovie = null;
        }
      })
      .addCase(deleteMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSearchTerm,
  setSelectedGenre,
  setSortBy,
  setSortOrder,
  resetFilters,
  clearSelectedMovie,
} = movieSlice.actions;
export default movieSlice.reducer; 