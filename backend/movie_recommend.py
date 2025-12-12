"""
Lightweight Movie Recommendation System
Optimized for minimal memory usage and fast training
"""

import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
import pickle
import warnings
warnings.filterwarnings('ignore')

class LightweightMovieRecommender:
    def __init__(self):
        self.movies_df = None
        self.ratings_df = None
        self.user_movie_matrix = None
        self.movie_similarity = None
        self.movie_stats = None
        
    def load_data_minimal(self, movies_path, ratings_path, 
                         max_users=1000, max_ratings=20000):
        """
        Load minimal data for ultra-lightweight model
        """
        print("Loading minimal dataset...")
        print(f"Target: {max_users} users, {max_ratings} ratings max")
        
        # Load movies
        print("Loading movies...")
        self.movies_df = pd.read_csv(movies_path)
        if 'movieId' in self.movies_df.columns:
            self.movies_df.rename(columns={'movieId': 'movie_id'}, inplace=True)
        print(f"✓ Loaded {len(self.movies_df)} movies")
        
        # Load ratings with aggressive sampling
        print("Loading ratings (minimal sample)...")
        
        # Strategy: Load in one go and aggressively sample
        chunk = pd.read_csv(ratings_path, nrows=max_ratings * 3)  # Load 3x buffer
        
        if 'userId' in chunk.columns:
            chunk.rename(columns={'userId': 'user_id', 'movieId': 'movie_id'}, inplace=True)
        
        # Keep only most active users
        user_counts = chunk['user_id'].value_counts()
        top_users = user_counts.head(max_users).index
        self.ratings_df = chunk[chunk['user_id'].isin(top_users)]
        
        # Limit total ratings
        if len(self.ratings_df) > max_ratings:
            self.ratings_df = self.ratings_df.sample(n=max_ratings, random_state=42)
        
        print(f"✓ Final: {len(self.ratings_df):,} ratings")
        print(f"✓ Users: {self.ratings_df['user_id'].nunique():,}")
        print(f"✓ Movies: {self.ratings_df['movie_id'].nunique():,}")
        
        return self
    
    def preprocess_minimal(self, min_ratings=3):
        """Minimal preprocessing"""
        print("\nPreprocessing...")
        
        # Remove duplicates
        self.ratings_df = self.ratings_df.drop_duplicates(['user_id', 'movie_id'])
        
        # Keep only movies with minimum ratings
        movie_counts = self.ratings_df['movie_id'].value_counts()
        valid_movies = movie_counts[movie_counts >= min_ratings].index
        self.ratings_df = self.ratings_df[self.ratings_df['movie_id'].isin(valid_movies)]
        
        # Keep only active users
        user_counts = self.ratings_df['user_id'].value_counts()
        valid_users = user_counts[user_counts >= min_ratings].index
        self.ratings_df = self.ratings_df[self.ratings_df['user_id'].isin(valid_users)]
        
        print(f"✓ After filtering: {len(self.ratings_df):,} ratings")
        
        # Create sparse user-movie matrix
        print("Creating matrix...")
        self.user_movie_matrix = self.ratings_df.pivot_table(
            index='user_id',
            columns='movie_id',
            values='rating'
        ).fillna(0)
        
        print(f"✓ Matrix: {self.user_movie_matrix.shape}")
        
        # Precompute movie statistics for popularity-based recommendations
        self.movie_stats = self.ratings_df.groupby('movie_id').agg({
            'rating': ['mean', 'count']
        }).reset_index()
        self.movie_stats.columns = ['movie_id', 'avg_rating', 'num_ratings']
        
        # Weighted rating (IMDB formula)
        m = self.movie_stats['num_ratings'].quantile(0.6)
        C = self.movie_stats['avg_rating'].mean()
        
        self.movie_stats['score'] = (
            (self.movie_stats['num_ratings'] / (self.movie_stats['num_ratings'] + m)) * 
            self.movie_stats['avg_rating'] +
            (m / (self.movie_stats['num_ratings'] + m)) * C
        )
        
        return self
    
    def build_item_similarity(self):
        """Build lightweight item-based collaborative filtering"""
        print("\nBuilding similarity matrix...")
        
        # Use only movie vectors (transpose of user-movie matrix)
        movie_matrix = self.user_movie_matrix.T
        
        # Compute cosine similarity
        self.movie_similarity = cosine_similarity(movie_matrix)
        
        print(f"✓ Similarity matrix: {self.movie_similarity.shape}")
        return self
    
    def get_popular_movies(self, n=10):
        """Get top popular movies"""
        popular = self.movie_stats.nlargest(n, 'score')
        result = popular.merge(self.movies_df, on='movie_id', how='left')
        return result[['movie_id', 'title', 'genres', 'avg_rating', 'num_ratings']]
    
    def recommend_similar(self, movie_id, n=10):
        """Get similar movies using collaborative filtering"""
        try:
            if movie_id not in self.user_movie_matrix.columns:
                print(f"Movie {movie_id} not in matrix")
                return pd.DataFrame()
            
            # Get movie index
            movie_idx = self.user_movie_matrix.columns.get_loc(movie_id)
            
            # Get similarity scores
            sim_scores = self.movie_similarity[movie_idx]
            
            # Get top N similar movies (excluding itself)
            similar_indices = np.argsort(sim_scores)[::-1][1:n+1]
            similar_ids = self.user_movie_matrix.columns[similar_indices].tolist()
            
            # Get movie details
            recommendations = self.movies_df[self.movies_df['movie_id'].isin(similar_ids)].copy()
            
            # Add similarity scores
            sim_dict = {movie_id: sim_scores[idx] for idx, movie_id in zip(similar_indices, similar_ids)}
            recommendations['similarity'] = recommendations['movie_id'].map(sim_dict)
            recommendations = recommendations.sort_values('similarity', ascending=False)
            
            return recommendations[['movie_id', 'title', 'genres', 'similarity']].head(n)
            
        except Exception as e:
            print(f"Error: {e}")
            return pd.DataFrame()
    
    def recommend_for_user_simple(self, user_id, n=10):
        """Simple user recommendations based on similar movies"""
        try:
            if user_id not in self.user_movie_matrix.index:
                print(f"User {user_id} not found, returning popular movies")
                return self.get_popular_movies(n)
            
            # Get user's rated movies
            user_ratings = self.user_movie_matrix.loc[user_id]
            rated_movies = user_ratings[user_ratings > 0]
            
            if len(rated_movies) == 0:
                return self.get_popular_movies(n)
            
            # Get top rated movies by this user
            top_rated = rated_movies.nlargest(5)
            
            # Collect recommendations from similar movies
            all_recs = []
            for movie_id, rating in top_rated.items():
                if movie_id in self.user_movie_matrix.columns:
                    movie_idx = self.user_movie_matrix.columns.get_loc(movie_id)
                    sim_scores = self.movie_similarity[movie_idx]
                    
                    # Weight by user's rating
                    weighted_scores = sim_scores * (rating / 5.0)
                    all_recs.append(weighted_scores)
            
            # Average scores
            if len(all_recs) > 0:
                avg_scores = np.mean(all_recs, axis=0)
                
                # Remove already rated movies
                for movie_id in rated_movies.index:
                    if movie_id in self.user_movie_matrix.columns:
                        idx = self.user_movie_matrix.columns.get_loc(movie_id)
                        avg_scores[idx] = -1
                
                # Get top recommendations
                top_indices = np.argsort(avg_scores)[::-1][:n]
                rec_ids = self.user_movie_matrix.columns[top_indices].tolist()
                
                recommendations = self.movies_df[self.movies_df['movie_id'].isin(rec_ids)].copy()
                score_dict = {movie_id: avg_scores[idx] for idx, movie_id in zip(top_indices, rec_ids)}
                recommendations['score'] = recommendations['movie_id'].map(score_dict)
                recommendations = recommendations.sort_values('score', ascending=False)
                
                return recommendations[['movie_id', 'title', 'genres', 'score']].head(n)
            else:
                return self.get_popular_movies(n)
                
        except Exception as e:
            print(f"Error: {e}")
            return self.get_popular_movies(n)
    
    def search_movies(self, query, n=10):
        """Search movies by title"""
        query = query.lower()
        mask = self.movies_df['title'].str.lower().str.contains(query, na=False)
        results = self.movies_df[mask].copy()
        
        # Add ratings if available
        if self.movie_stats is not None:
            results = results.merge(
                self.movie_stats[['movie_id', 'avg_rating', 'num_ratings']], 
                on='movie_id', 
                how='left'
            )
            results = results.sort_values('num_ratings', ascending=False, na_position='last')
        
        return results.head(n)
    
    def save_model(self, filepath='lightweight_model.pkl'):
        """Save lightweight model"""
        print("\nSaving model...")
        
        model_data = {
            'movies_df': self.movies_df,
            'movie_stats': self.movie_stats,
            'user_movie_matrix': self.user_movie_matrix,
            'movie_similarity': self.movie_similarity,
            'ratings_sample': self.ratings_df.head(100)  # Keep small sample for reference
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        import os
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"✓ Model saved: {filepath} ({size_mb:.1f} MB)")
        return self
    
    def evaluate(self):
        """Print model statistics"""
        print("\n" + "="*60)
        print("LIGHTWEIGHT MODEL STATISTICS")
        print("="*60)
        print(f"Movies in catalog:    {len(self.movies_df):,}")
        print(f"Ratings loaded:       {len(self.ratings_df):,}")
        print(f"Active users:         {self.user_movie_matrix.shape[0]:,}")
        print(f"Rated movies:         {self.user_movie_matrix.shape[1]:,}")
        print(f"Matrix size:          {self.user_movie_matrix.shape}")
        
        sparsity = (1 - len(self.ratings_df) / 
                   (self.user_movie_matrix.shape[0] * self.user_movie_matrix.shape[1])) * 100
        print(f"Sparsity:             {sparsity:.1f}%")
        print(f"Avg rating:           {self.ratings_df['rating'].mean():.2f}/5.0")
        print("="*60)


# Training script
if __name__ == "__main__":
    print("="*60)
    print("LIGHTWEIGHT MOVIE RECOMMENDER - TRAINING")
    print("="*60)
    
    recommender = LightweightMovieRecommender()
    
    try:
        # ADJUST THESE FOR EVEN LIGHTER MODEL:
        # Smaller values = faster, less memory
        recommender.load_data_minimal(
            'movies.csv',
            'ratings.csv',
            max_users=800,      # Only 800 most active users
            max_ratings=15000   # Only 15k ratings total
        )
        
        recommender.preprocess_minimal(min_ratings=3)
        recommender.build_item_similarity()
        recommender.evaluate()
        
        # Test recommendations
        print("\n" + "="*60)
        print("TESTING RECOMMENDATIONS")
        print("="*60)
        
        # Popular movies
        print("\n🌟 Top 5 Popular Movies:")
        popular = recommender.get_popular_movies(5)
        for idx, row in popular.iterrows():
            print(f"  • {row['title']}")
            print(f"    ⭐ {row['avg_rating']:.1f}/5.0 ({int(row['num_ratings'])} ratings)")
        
        # Similar movies
        if len(popular) > 0:
            test_movie = popular.iloc[0]
            print(f"\n🎬 Similar to: {test_movie['title']}")
            similar = recommender.recommend_similar(test_movie['movie_id'], n=5)
            if not similar.empty:
                for idx, row in similar.iterrows():
                    print(f"  • {row['title']} (similarity: {row['similarity']:.2f})")
        
        # User recommendations
        if len(recommender.user_movie_matrix) > 0:
            test_user = recommender.user_movie_matrix.index[0]
            print(f"\n👤 Recommendations for User {test_user}:")
            user_recs = recommender.recommend_for_user_simple(test_user, n=5)
            if not user_recs.empty:
                for idx, row in user_recs.iterrows():
                    score = row.get('score', 0)
                    print(f"  • {row['title']} (score: {score:.2f})")
        
        recommender.save_model('lightweight_model.pkl')
        
        print("\n" + "="*60)
        print("✓ TRAINING COMPLETED!")
        print("="*60)
        print("\nModel saved as 'lightweight_model.pkl'")
        print("Ready for deployment!")
        
    except FileNotFoundError:
        print("\n❌ ERROR: Dataset files not found!")
        print("Ensure you have: movies.csv and ratings.csv")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("\n💡 Try even smaller parameters:")
        print("  max_users=500, max_ratings=10000")