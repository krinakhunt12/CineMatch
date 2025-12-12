import { useState, useEffect, useCallback } from 'react';
import { movieAPI } from '../services/api';

// Hook for fetching movies
export const useMovies = (selectedGenre = 'All') => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (selectedGenre === 'All') {
        data = await movieAPI.getPopularMovies(20);
      } else {
        data = await movieAPI.getMoviesByGenre(selectedGenre, 20);
      }
      
      setMovies(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, loading, error, refetch: fetchMovies };
};

// Hook for searching movies
export const useMovieSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await movieAPI.searchMovies(query, 10);
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Error searching movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
};

// Hook for getting similar movies
export const useSimilarMovies = (movieId) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) return;

    const fetchSimilar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await movieAPI.getSimilarMovies(movieId, 6);
        setSimilar(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching similar movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [movieId]);

  return { similar, loading, error };
};

// Hook for genres
export const useGenres = () => {
  const [genres, setGenres] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const data = await movieAPI.getGenres();
        setGenres(['All', ...data]);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching genres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return { genres, loading, error };
};