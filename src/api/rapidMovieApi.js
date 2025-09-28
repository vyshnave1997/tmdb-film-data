// src/api/rapidMovieApi.js
import axios from 'axios';

const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.REACT_APP_RAPIDAPI_HOST;

const apiClient = axios.create({
  baseURL: 'https://'+ RAPIDAPI_HOST,
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  },
});

export const searchMovies = async (query) => {
  // adjust path + query parameters based on the API’s docs
  const response = await apiClient.get('/search/movie', {
    params: {
      query: query,
      // maybe “page”, “year”, etc depending on API
    },
  });
  return response.data;
};

export const getMovieDetails = async (movieId) => {
  const response = await apiClient.get(`/movie/${movieId}`, {
    params: {
      // sometimes you may need to pass extra fields
    },
  });
  return response.data;
};
