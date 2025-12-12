# 🎬 AI-Powered Movie Recommendation System

A full-stack movie recommendation system using Machine Learning (Python) and modern web technologies (React + Vite + Tailwind).

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   React Frontend│◄────────┤  Flask API       │
│   (Port 3000)   │  REST   │  (Port 5000)     │
│                 │         │                  │
│ • Vite          │         │ • scikit-learn   │
│ • Tailwind CSS  │         │ • Pandas         │
│ • Lucide Icons  │         │ • NumPy          │
└─────────────────┘         └──────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  ML Model        │
                            │  (Pickle file)   │
                            │                  │
                            │ • Collaborative  │
                            │   Filtering      │
                            │ • Content-based  │
                            └──────────────────┘
```

## 📁 Complete Project Structure

```
movie-recommendation-system/
│
├── backend/                          # Python Flask API
│   ├── app.py                        # Main Flask application
│   ├── movie_recommend.py            # ML model training script
│   ├── requirements.txt              # Python dependencies
│   ├── models/                       # Trained models directory
│   │   └── lightweight_model.pkl     # Trained model (generated)
│   └── data/                         # Dataset files
│       ├── movies.csv                # Movies dataset
│       └── ratings.csv               # User ratings dataset
│
├── frontend/                         # React Vite Application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── App.jsx                   # Main integrated app
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- MovieLens dataset (movies.csv, ratings.csv)

### Step 1: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors pandas numpy scikit-learn scipy

# Download MovieLens dataset
# Option 1: Download from https://grouplens.org/datasets/movielens/
# Option 2: Use the small dataset (100k ratings)
# Place movies.csv and ratings.csv in the backend/data/ directory

# Train the model (this will create lightweight_model.pkl)
python movie_recommend.py

# Start Flask server
python app.py
```

The backend will run on `http://localhost:5000`

### Step 2: Setup Frontend

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Initialize Vite project (if not already created)
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Initialize Tailwind
npx tailwindcss init -p

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### Step 3: Configure Files

#### `backend/requirements.txt`
```txt
flask==3.0.0
flask-cors==4.0.0
pandas==2.1.0
numpy==1.24.3
scikit-learn==1.3.0
scipy==1.11.0
```

#### `frontend/package.json` (add these dependencies)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.263.1"
  }
}
```

#### `frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

#### `frontend/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### `frontend/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### `frontend/src/main.jsx`
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 📊 Getting the Dataset

### Option 1: MovieLens 100K (Recommended for testing)
```bash
cd backend/data
wget http://files.grouplens.org/datasets/movielens/ml-latest-small.zip
unzip ml-latest-small.zip
mv ml-latest-small/movies.csv .
mv ml-latest-small/ratings.csv .
```

### Option 2: MovieLens 25M (Full dataset)
Download from: https://grouplens.org/datasets/movielens/25m/

## 🔧 API Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/api/health` | GET | Check API health | `/api/health` |
| `/api/popular` | GET | Get popular movies | `/api/popular?n=20` |
| `/api/movies/search` | GET | Search movies | `/api/movies/search?q=inception` |
| `/api/movies/<id>/similar` | GET | Get similar movies | `/api/movies/1/similar?n=10` |
| `/api/movies/<id>` | GET | Get movie details | `/api/movies/1` |
| `/api/genres` | GET | Get all genres | `/api/genres` |
| `/api/movies/by-genre` | GET | Get movies by genre | `/api/movies/by-genre?genre=Action` |

## ✨ Features

### Frontend Features
- 🎨 Beautiful, modern UI with glassmorphism effects
- 🔍 Real-time movie search
- 🎭 Genre-based filtering
- ❤️ Favorite movies functionality
- 📱 Fully responsive design
- ⚡ Fast loading with Vite
- 🎬 Movie details and similar recommendations
- 🌈 Smooth animations and transitions

### Backend Features
- 🤖 Machine Learning powered recommendations
- 📊 Collaborative filtering
- 🎯 Content-based filtering
- 📈 Popularity-based ranking
- 🔍 Fast search functionality
- 💾 Lightweight model (<50MB)
- 🚀 RESTful API architecture

## 🧪 Testing the Application

1. **Start Backend:**
```bash
cd backend
python app.py
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Open Browser:**
Navigate to `http://localhost:3000`

4. **Test Features:**
   - Browse popular movies
   - Search for movies (e.g., "Toy Story")
   - Filter by genre
   - Click on a movie to see similar recommendations
   - Add movies to favorites

## 🐛 Troubleshooting

### Backend Issues

**Issue:** `ModuleNotFoundError: No module named 'flask'`
```bash
pip install flask flask-cors
```

**Issue:** `FileNotFoundError: movies.csv not found`
- Ensure movies.csv and ratings.csv are in `backend/data/` directory
- Download MovieLens dataset and extract

**Issue:** Port 5000 already in use
```python
# In app.py, change the port:
app.run(debug=True, port=5001)
```

### Frontend Issues

**Issue:** `Cannot connect to backend`
- Ensure Flask server is running on port 5000
- Check browser console for CORS errors
- Verify vite.config.js proxy settings

**Issue:** Tailwind styles not working
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Issue:** Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Tips

### Backend Optimization
- Adjust `max_users` and `max_ratings` in `movie_recommend.py` for faster training
- Use caching for frequently accessed endpoints
- Consider Redis for production caching

### Frontend Optimization
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Security Notes

For production deployment:
- Add authentication to Flask API
- Implement rate limiting
- Use environment variables for configuration
- Enable HTTPS
- Validate all user inputs

## 📝 Development Workflow

1. Make changes to React components in `frontend/src/`
2. Test changes at `http://localhost:3000`
3. Make API changes in `backend/app.py`
4. Test API endpoints with tools like Postman or curl
5. Retrain model if needed: `python movie_recommend.py`

## 🌐 Deployment

### Backend (Flask)
- Deploy to Heroku, AWS, or DigitalOcean
- Use Gunicorn for production WSGI server
- Set environment variables for configuration

### Frontend (React)
- Deploy to Vercel, Netlify, or AWS S3
- Update API_BASE_URL to production backend URL
- Enable build optimizations

## 📚 Resources

- [MovieLens Dataset](https://grouplens.org/datasets/movielens/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [scikit-learn](https://scikit-learn.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development!

---

## 📊 Dataset

This project uses the **Movie Recommendation System dataset** from Kaggle.

🔗 Dataset Link:  
https://www.kaggle.com/datasets/parasharmanas/movie-recommendation-system

The dataset is not included in this repository due to its large size (623 MB).  
Please download it manually from Kaggle and place the files inside:


Folder structure after adding the dataset:

backend/
  ratings.csv
  movies.csv

Made with ❤️ using React, Flask, and Machine Learning