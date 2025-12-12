from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the trained model
MODEL_PATH = 'models/lightweight_model.pkl'
model_data = None
recommender_instance = None

def load_model():
    global model_data, recommender_instance
    try:
        with open(MODEL_PATH, 'rb') as f:
            model_data = cache = pickle.load(f)
        
        # Recreate recommender instance with loaded data
        from movie_recommend import LightweightMovieRecommender
        recommender_instance = LightweightMovieRecommender()
        recommender_instance.movies_df = model_data['movies_df']
        recommender_instance.movie_stats = model_data['movie_stats']
        recommender_instance.user_movie_matrix = model_data['user_movie_matrix']
        recommender_instance.movie_similarity = model_data['movie_similarity']
        
        print("✓ Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Load model on startup
load_model()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": model_data is not None})

@app.route('/api/popular', methods=['GET'])
def get_popular_movies():
    try:
        n = request.args.get('n', default=20, type=int)
        popular = recommender_instance.get_popular_movies(n)
        return jsonify(popular.to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/search', methods=['GET'])
def search_movies():
    try:
        query = request.args.get('q', '')
        n = request.args.get('n', default=20, type=int)
        
        if not query:
            return jsonify([])
        
        results = recommender_instance.search_movies(query, n)
        return jsonify(results.to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/<int:movie_id>/similar', methods=['GET'])
def get_similar_movies(movie_id):
    try:
        n = request.args.get('n', default=10, type=int)
        similar = recommender_instance.recommend_similar(movie_id, n)
        
        if similar.empty:
            return jsonify([])
        
        return jsonify(similar.to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        movie = recommender_instance.movies_df[
            recommender_instance.movies_df['movie_id'] == movie_id
        ]
        
        if movie.empty:
            return jsonify({"error": "Movie not found"}), 404
        
        movie_dict = movie.iloc[0].to_dict()
        
        # Add stats if available
        if recommender_instance.movie_stats is not None:
            stats = recommender_instance.movie_stats[
                recommender_instance.movie_stats['movie_id'] == movie_id
            ]
            if not stats.empty:
                movie_dict['avg_rating'] = float(stats.iloc[0]['avg_rating'])
                movie_dict['num_ratings'] = int(stats.iloc[0]['num_ratings'])
        
        return jsonify(movie_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recommendations/user/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    try:
        n = request.args.get('n', default=10, type=int)
        recommendations = recommender_instance.recommend_for_user_simple(user_id, n)
        return jsonify(recommendations.to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/genres', methods=['GET'])
def get_genres():
    try:
        # Extract unique genres from movies
        all_genres = set()
        for genres_str in recommender_instance.movies_df['genres'].dropna():
            genres = genres_str.split('|')
            all_genres.update(genres)
        
        return jsonify(sorted(list(all_genres)))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/by-genre', methods=['GET'])
def get_movies_by_genre():
    try:
        genre = request.args.get('genre', '')
        n = request.args.get('n', default=20, type=int)
        
        if not genre or genre.lower() == 'all':
            return get_popular_movies()
        
        # Filter movies by genre
        mask = recommender_instance.movies_df['genres'].str.contains(
            genre, case=False, na=False
        )
        filtered_movies = recommender_instance.movies_df[mask]
        
        # Merge with stats and sort by score
        if recommender_instance.movie_stats is not None:
            result = filtered_movies.merge(
                recommender_instance.movie_stats,
                on='movie_id',
                how='left'
            )
            result = result.sort_values('score', ascending=False, na_position='last')
        else:
            result = filtered_movies
        
        return jsonify(result.head(n).to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)