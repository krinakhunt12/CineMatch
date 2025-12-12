import { useState, useEffect } from 'react';
import { Film, Heart, Search, Star, TrendingUp } from 'lucide-react';
import { movieAPI } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
// Main App Component
const Movie = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);

  // Helpers: normalize various API response shapes into an array of movie objects
  const normalizeMovies = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (typeof resp === 'string') {
      try {
        const safe = resp.replace(/\bNaN\b/g, 'null');
        const parsed = JSON.parse(safe);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed.results)) return parsed.results;
        if (Array.isArray(parsed.movies)) return parsed.movies;
        if (Array.isArray(parsed.data)) return parsed.data;
      } catch (e) {
        console.warn('Failed to parse string movies response:', e);
      }
    }
    if (resp && Array.isArray(resp.results)) return resp.results;
    if (resp && Array.isArray(resp.movies)) return resp.movies;
    if (resp && Array.isArray(resp.data)) return resp.data;
    if (typeof resp === 'object') {
      const vals = Object.values(resp);
      if (vals.length > 0 && vals.every(v => typeof v === 'object' && ('movie_id' in v || 'title' in v))) {
        return vals;
      }
    }
    console.error('Unexpected movies response shape, expected array-like:', resp);
    return [];
  };

  const sanitizeMovies = (arr) => (arr || []).map(m => ({
    ...m,
    avg_rating: Number.isFinite(m?.avg_rating) ? m.avg_rating : null,
    num_ratings: Number.isFinite(m?.num_ratings) ? m.num_ratings : null,
    score: Number.isFinite(m?.score) ? m.score : null,
  }));

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await movieAPI.getGenres();
        setGenres(['All', ...genreList.slice(0, 10)]);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies based on search or genre
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data;
        if (searchQuery.trim()) {
          data = await movieAPI.searchMovies(searchQuery, 20);
        } else if (selectedGenre === 'All') {
          data = await movieAPI.getPopularMovies(20);
        } else {
          data = await movieAPI.getMoviesByGenre(selectedGenre, 20);
        }
        
        setMovies(sanitizeMovies(normalizeMovies(data)));
      } catch (err) {
        setError(err.message || 'Failed to load movies. Make sure the backend is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchMovies, searchQuery ? 500 : 0);
    return () => clearTimeout(debounceTimer);
  }, [selectedGenre, searchQuery]);

  // Fetch similar movies when a movie is selected
  useEffect(() => {
    if (selectedMovie) {
      const fetchSimilar = async () => {
        try {
          const similar = await movieAPI.getSimilarMovies(selectedMovie.movie_id, 6);
          setSimilarMovies(sanitizeMovies(normalizeMovies(similar)));
        } catch (err) {
          console.error('Failed to fetch similar movies:', err);
          setSimilarMovies([]);
        }
      };
      fetchSimilar();
    }
  }, [selectedMovie]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-600/20 to-transparent"></div>
        <div className="container mx-auto px-6 py-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-12 h-12 text-sky-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              CineMatch
            </h1>
          </div>
          <p className="text-center text-xl text-sky-200 mb-8">
            AI-Powered Movie Recommendations
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sky-400" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-sky-500/30 rounded-2xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-white placeholder-sky-300"
              />
            </div>
          </div>
          
          {/* Genre Filter */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre);
                  setSearchQuery('');
                }}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedGenre === genre
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/50 scale-105'
                    : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Movie Details */}
      {selectedMovie && (
        <div className="container mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-sky-900/50 to-cyan-900/50 rounded-3xl p-8 backdrop-blur-sm border border-sky-500/30 mb-8">
            <button
              onClick={() => setSelectedMovie(null)}
              className="mb-4 text-sky-300 hover:text-sky-100 transition-colors"
            >
              ← Back to all movies
            </button>
            <h2 className="text-4xl font-bold mb-4">{selectedMovie.title}</h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-2 bg-sky-500/30 rounded-full">{selectedMovie.genres}</span>
              {selectedMovie.avg_rating && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">{selectedMovie.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {similarMovies.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-sky-400" />
                  Similar Movies
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {similarMovies.map(movie => (
                    <div
                      key={movie.movie_id}
                      onClick={() => handleMovieClick(movie)}
                      className="cursor-pointer bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all hover:scale-105"
                    >
                      <h4 className="font-semibold text-sm line-clamp-2 mb-2">{movie.title}</h4>
                      <p className="text-xs text-sky-300 line-clamp-1">{movie.genres}</p>
                      {movie.similarity && (
                        <p className="text-xs text-green-400 mt-1">
                          {(movie.similarity * 100).toFixed(0)}% match
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-6">
          <ErrorAlert 
            message={error} 
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Movies Grid */}
      <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-6 h-6 text-sky-400" />
          <h2 className="text-3xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` :
             selectedGenre === 'All' ? 'Trending Now' : `${selectedGenre} Movies`}
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-sky-400 mx-auto mb-4 opacity-50" />
            <p className="text-xl text-slate-400">
              {searchQuery ? 'No movies found for your search' : 'No movies found in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map(movie => (
              <MovieCard
                key={movie.movie_id}
                movie={movie}
                isFavorite={favorites.includes(movie.movie_id)}
                onFavoriteToggle={toggleFavorite}
                onMovieClick={handleMovieClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 py-8 text-center text-slate-400 border-t border-sky-500/20">
        <p className="flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 fill-cyan-400 text-cyan-400" /> using ML-powered recommendations
        </p>
        <p className="text-sm mt-2 text-sky-300">
          Backend: Python Flask + scikit-learn | Frontend: React + Vite + Tailwind
        </p>
      </div>
    </div>
  );
};

export default Movie;