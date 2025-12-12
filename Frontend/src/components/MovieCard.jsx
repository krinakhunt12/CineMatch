import { useState } from 'react';
import { Film, Heart, Info, Play, Star } from 'lucide-react';

export const MovieCard = ({ movie, onFavoriteToggle, isFavorite, onMovieClick }) => {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = (title) => {
    const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIds = [
      '1536440136628-849c177e76a1', '1478720568477-152d9b164e26',
      '1485846234645-a62644f84728', '1594908900066-3f47337549d8',
      '1489599849927-2ee91cede3ba', '1518676590629-3dcbd9c5a5c9',
      '1440404653325-ab127d49abc1', '1574267432644-f297ae7aa0f5'
    ];
    const imageId = imageIds[seed % imageIds.length];
    return `https://images.unsplash.com/photo-${imageId}?w=500&h=750&fit=crop`;
  };

  const rating = movie.avg_rating || movie.score || 0;
  const displayRating = typeof rating === 'number' ? rating.toFixed(1) : '0.0';

  return (
    <div
      className="group relative bg-gradient-to-b from-sky-900/40 to-slate-900/40 rounded-2xl overflow-hidden backdrop-blur-sm border border-sky-500/20 hover:border-sky-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/30 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onMovieClick(movie)}
    >
      <div className="relative h-96 overflow-hidden">
        {!imageError ? (
          <img
            src={getImageUrl(movie.title)}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-600 to-cyan-600 flex items-center justify-center">
            <Film className="w-20 h-20 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(movie.movie_id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110 z-10"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isFavorite ? 'fill-cyan-400 text-cyan-400' : 'text-white'
            }`}
          />
        </button>

        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button className="p-4 rounded-full bg-sky-600 hover:bg-sky-500 transition-all duration-300 hover:scale-110 shadow-lg">
            <Play className="w-8 h-8 fill-white" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold group-hover:text-sky-400 transition-colors duration-300 line-clamp-1">
            {movie.title}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full flex-shrink-0 ml-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">{displayRating}</span>
            </div>
          )}
        </div>
        
        <p className="text-sky-300 text-sm mb-2 line-clamp-2">
          {movie.genres || 'Movie'}
        </p>
        
        <div className="flex items-center justify-between text-sm text-slate-400">
          {movie.num_ratings && (
            <span className="text-xs">{movie.num_ratings} ratings</span>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onMovieClick(movie);
          }}
          className="w-full mt-4 py-2 bg-gradient-to-r from-sky-600/20 to-cyan-600/20 hover:from-sky-600 hover:to-cyan-600 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-sky-500/30 hover:border-sky-500"
        >
          <Info className="w-4 h-4" />
          More Info
        </button>
      </div>
    </div>
  );
};