import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../api/rapidMovieApi';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMovieDetails(id);
        setMovie(data);
      } catch (err) {
        console.error('Detail error:', err);
        setError('Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) return <div>Loading movie details …</div>;
  if (error) return <div>{error}</div>;
  if (!movie) return null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '';

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>{movie.title}</h1>
      {posterUrl && <img src={posterUrl} alt={movie.title} />}
      <p>Release: {movie.release_date}</p>
      <p>Rating: {movie.vote_average}</p>
      <p>{movie.overview}</p>
      {/* You can show more fields depending on what the API returns */}
    </div>
  );
}
