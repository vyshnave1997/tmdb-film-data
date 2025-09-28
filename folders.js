// createStructure.js

const fs = require('fs');
const path = require('path');

/**
 * Create a directory (and all parent directories) if it doesn't exist.
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Create a file with optional content, but only if it doesn't already exist.
 * @param {string} filePath
 * @param {string} content
 */
function ensureFile(filePath, content = '') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

/**
 * Main function to create the folder + file scaffold.
 * baseDir = root directory under which to create the structure (e.g. "movie-app/src")
 */
function scaffoldProject(baseDir) {
  // Folders to create (relative to baseDir)
  const dirs = [
    'src/api',
    'src/assets/images',
    'src/assets/styles',
    'src/components',
    'src/pages',
    'src/hooks',
    'src/context',
    'src/utils',
  ];

  // Files to create (relative to baseDir) with optional starter content
  const files = {
    // top-level in baseDir
    'src/index.js': `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\n\nReactDOM.render(<App />, document.getElementById('root'));`,
    'src/App.jsx': `import React from 'react';\n// import routes/pages …\n\nfunction App() {\n  return (\n    <div>\n      <h1>Movie App</h1>\n    </div>\n  );\n}\n\nexport default App;\n`,
    // API file
    'src/api/rapidMovieApi.js': `// API client for RapidAPI movie endpoints\nimport axios from 'axios';\n\nconst RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;\nconst RAPIDAPI_HOST = process.env.REACT_APP_RAPIDAPI_HOST;\n\nconst apiClient = axios.create({\n  baseURL: 'https://' + RAPIDAPI_HOST,\n  headers: {\n    'X-RapidAPI-Key': RAPIDAPI_KEY,\n    'X-RapidAPI-Host': RAPIDAPI_HOST,\n  },\n});\n\nexport async function searchMovies(query) {\n  const response = await apiClient.get('/search/movie', { params: { query } });\n  return response.data;\n}\n\nexport async function getMovieDetails(id) {\n  const response = await apiClient.get(`/movie/${id}`);\n  return response.data;\n}\n`,
    // Example component files
    'src/components/SearchBar.jsx': `import React from 'react';\n\nexport default function SearchBar({ value, onChange, onSearch }) {\n  const onKeyDown = e => e.key === 'Enter' && onSearch();\n  return (\n    <div>\n      <input type=\"text\" value={value} onChange={onChange} onKeyDown={onKeyDown} />\n      <button onClick={onSearch}>Search</button>\n    </div>\n  );\n}\n`,
    'src/components/MovieCard.jsx': `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nexport default function MovieCard({ movie }) {\n  const poster = movie.poster_path\n    ? \`https://image.tmdb.org/t/p/w300\${movie.poster_path}\`\n    : '';\n  return (\n    <div>\n      <Link to={\`/movie/\${movie.id}\`}>\n        {poster && <img src={poster} alt={movie.title} />}\n        <h3>{movie.title}</h3>\n      </Link>\n    </div>\n  );\n}\n`,
    // Page files
    'src/pages/Home.jsx': `import React, { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport SearchBar from '../components/SearchBar';\n\nexport default function Home() {\n  const [q, setQ] = useState('');\n  const navigate = useNavigate();\n  const doSearch = () => {\n    if (q.trim()) navigate(\`/search/\${encodeURIComponent(q)}\`);\n  };\n  return (\n    <div>\n      <h1>Home</h1>\n      <SearchBar value={q} onChange={e => setQ(e.target.value)} onSearch={doSearch} />\n    </div>\n  );\n}\n`,
    'src/pages/SearchResults.jsx': `import React, { useEffect, useState } from 'react';\nimport { useParams } from 'react-router-dom';\nimport { searchMovies } from '../api/rapidMovieApi';\nimport MovieCard from '../components/MovieCard';\n\nexport default function SearchResults() {\n  const { query } = useParams();\n  const [movies, setMovies] = useState([]);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    (async () => {\n      try {\n        setLoading(true);\n        const data = await searchMovies(query);\n        setMovies(data.results || data.movies || []);\n      } catch (err) {\n        console.error(err);\n        setError('Error fetching');\n      } finally {\n        setLoading(false);\n      }\n    })();\n  }, [query]);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>{error}</div>;\n\n  return (\n    <div>\n      <h2>Results for “{query}”</h2>\n      <div>\n        {movies.map(m => <MovieCard key={m.id} movie={m} />)}\n      </div>\n    </div>\n  );\n}\n`,
    'src/pages/MovieDetail.jsx': `import React, { useEffect, useState } from 'react';\nimport { useParams, useNavigate } from 'react-router-dom';\nimport { getMovieDetails } from '../api/rapidMovieApi';\n\nexport default function MovieDetail() {\n  const { id } = useParams();\n  const navigate = useNavigate();\n  const [movie, setMovie] = useState(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    (async () => {\n      try {\n        setLoading(true);\n        const data = await getMovieDetails(id);\n        setMovie(data);\n      } catch (err) {\n        console.error(err);\n        setError('Error loading details');\n      } finally {\n        setLoading(false);\n      }\n    })();\n  }, [id]);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>{error}</div>;\n  if (!movie) return null;\n\n  const poster = movie.poster_path\n    ? \`https://image.tmdb.org/t/p/w500\${movie.poster_path}\`\n    : '';\n\n  return (\n    <div>\n      <button onClick={() => navigate(-1)}>Back</button>\n      <h1>{movie.title}</h1>\n      {poster && <img src={poster} alt={movie.title} />}\n      <p>{movie.overview}</p>\n    </div>\n  );\n}\n`,
    // Optionally an .env file content (empty placeholder)
    '.env': `REACT_APP_RAPIDAPI_KEY=\nREACT_APP_RAPIDAPI_HOST=`,
    'README.md': `# Movie App\n\nThis project scaffolds a React app structure for a movie search + detail application using RapidAPI.`,
    'package.json': `{\n  \"name\": \"movie-app\",\n  \"version\": \"0.1.0\",\n  \"private\": true,\n  \"dependencies\": {\n    \"react\": \"^18.x\",\n    \"react-dom\": \"^18.x\",\n    \"react-router-dom\": \"^6.x\",\n    \"axios\": \"^1.x\"\n  }\n}`
  };

  // Create directories
  dirs.forEach(dir => {
    ensureDir(path.join(baseDir, dir));
  });

  // Create files
  Object.entries(files).forEach(([relativePath, content]) => {
    const fullPath = path.join(baseDir, relativePath);
    ensureDir(path.dirname(fullPath));
    ensureFile(fullPath, content);
  });

  console.log('Scaffolding complete under:', baseDir);
}

// Run it
const projectRoot = process.cwd();  // assume running in project root
scaffoldProject(projectRoot);
