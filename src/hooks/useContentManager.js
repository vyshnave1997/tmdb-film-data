// hooks/useContentManager.js
import { useState, useEffect, useCallback } from 'react';
import { BASE_URL, API_KEY } from '../config';

export const useContentManager = (storagePrefix, contentType, initialEndpoint = 'popular') => {
  // State management - NO localStorage/sessionStorage
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentEndpoint, setCurrentEndpoint] = useState(initialEndpoint);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Fetch content
  const fetchContent = async (endpoint = 'popular', page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      let url;
      
      // Handle anime TV series endpoints
      if (endpoint === 'anime') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
      } 
      else if (endpoint === 'anime-top_rated') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
      }
      else if (endpoint === 'anime-airing_today') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&air_date.gte=${new Date().toISOString().split('T')[0]}&air_date.lte=${new Date().toISOString().split('T')[0]}&page=${page}`;
      }
      else if (endpoint === 'anime-on_the_air') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&with_status=0&sort_by=popularity.desc&page=${page}`;
      }
      // Handle anime movie endpoints
      else if (endpoint === 'anime-movie-popular') {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
      }
      else if (endpoint === 'anime-movie-top_rated') {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
      }
      else if (endpoint === 'anime-movie-upcoming') {
        const today = new Date().toISOString().split('T')[0];
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&primary_release_date.gte=${today}&sort_by=popularity.desc&page=${page}`;
      }
      else if (endpoint === 'anime-movie-now_playing') {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&primary_release_date.gte=${thirtyDaysAgo.toISOString().split('T')[0]}&primary_release_date.lte=${thirtyDaysFromNow.toISOString().split('T')[0]}&sort_by=popularity.desc&page=${page}`;
      }
      // Handle genre filtering
      else if (endpoint.startsWith('genre-')) {
        const genreId = endpoint.split('-')[1];
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`;
      } 
      // Handle country filtering
      else if (endpoint.startsWith('country-')) {
        const countryCode = endpoint.split('-')[1];
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_origin_country=${countryCode}&page=${page}&sort_by=popularity.desc`;
      } 
      // Handle default endpoints
      else {
        url = `${BASE_URL}/${contentType}/${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key error. Please check the configuration.');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setItems(data.results || []);
      } else {
        setItems(prevItems => [...prevItems, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
      setHasMore(page < (data.total_pages || 1));
      
      if (reset) {
        setCurrentEndpoint(endpoint);
      }
    } catch (err) {
      setError(`Failed to load content: ${err.message}`);
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search content
  const searchContent = async (query, page = 1, reset = true) => {
    if (!query.trim()) {
      fetchContent('popular');
      return;
    }

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const response = await fetch(
        `${BASE_URL}/search/${contentType}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`
      );
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setItems(data.results || []);
      } else {
        setItems(prevItems => [...prevItems, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
      setHasMore(page < (data.total_pages || 1));
      
      if (reset) {
        setCurrentEndpoint('search');
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error('Error searching content:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more content
  const loadMoreContent = useCallback(() => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    
    if (currentEndpoint === 'search' && searchTerm) {
      searchContent(searchTerm, nextPage, false);
    } else {
      fetchContent(currentEndpoint, nextPage, false);
    }
  }, [currentPage, hasMore, loadingMore, currentEndpoint, searchTerm]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMoreContent();
    }
  }, [loadMoreContent]);

  // Handle item click
  const handleItemClick = (itemId, navigate) => {
    navigate(`/${contentType}/${itemId}`);
  };

  // Initial load
  useEffect(() => {
    fetchContent(initialEndpoint);
  }, []);

  return {
    items,
    loading,
    loadingMore,
    error,
    searchTerm,
    currentPage,
    totalPages,
    currentEndpoint,
    hasMore,
    selectedGenre,
    selectedCountry,
    setSearchTerm,
    setSelectedGenre,
    setSelectedCountry,
    fetchContent,
    searchContent,
    loadMoreContent,
    handleScroll,
    handleItemClick
  };
};