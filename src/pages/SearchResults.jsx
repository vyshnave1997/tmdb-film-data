import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { searchMovies } from '../api/rapidMovieApi';
import MovieCard from '../components/MovieCard';

export default function SearchResults() {
  const { query } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchMovies(query);
        // Depending on API, maybe `data.results` or `data.movies`, etc
        setMovies(data.results || data.movies || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search movies');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [query]);

  if (loading) return <div>Loading …</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Results for “{query}”</h2>
      {movies.length === 0 
        ? (<p>No movies found.</p>)
        : (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {movies.map(m => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )
      }
    </div>
  );
}
