// HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';
import ListPage from '../components/ListPage';
import { BASE_URL, API_KEY } from '../config';

const { Content } = Layout;

const HomePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentEndpoint, setCurrentEndpoint] = useState('popular');
  const [hasMore, setHasMore] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [contentType, setContentType] = useState('movie');

  const fetchGenres = async (type = 'movie') => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const fetchContent = async (endpoint = 'popular', page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      let url;
      
      // Handle anime endpoint - Animation genre (16) + Japanese origin
      if (endpoint === 'anime') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
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
      // Handle default endpoints (popular, top_rated, upcoming, etc.)
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
      const response = await fetch(`${BASE_URL}/search/${contentType}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`);
      
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

  const loadMoreContent = useCallback(() => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    
    if (currentEndpoint === 'search' && searchTerm) {
      searchContent(searchTerm, nextPage, false);
    } else {
      fetchContent(currentEndpoint, nextPage, false);
    }
  }, [currentPage, hasMore, loadingMore, currentEndpoint, searchTerm]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMoreContent();
    }
  }, [loadMoreContent]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchContent(searchTerm);
        setSelectedGenre(null);
        setSelectedCountry(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchContent('popular');
    fetchGenres(contentType);
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchGenres(contentType);
    setSelectedGenre(null);
    setSelectedCountry(null);
    setSearchTerm('');
    fetchContent('popular');
  }, [contentType]);

  const handleCategoryChange = (endpoint) => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedCountry(null);
    fetchContent(endpoint);
  };

  const handleGenreSelect = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    setSelectedGenre(genre);
    setSelectedCountry(null);
    setSearchTerm('');
    fetchContent(`genre-${genreId}`);
  };

  const handleCountrySelect = (countryCode) => {
    const country = countries.find(c => c.iso_3166_1 === countryCode);
    setSelectedCountry(country);
    setSelectedGenre(null);
    setSearchTerm('');
    fetchContent(`country-${countryCode}`);
  };

  const handleHomeClick = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedCountry(null);
    fetchContent('popular');
  };

  const handleAnimeClick = () => {
    setSearchTerm('');
    setSelectedCountry(null);
    // Set custom anime label
    setSelectedGenre({ id: 'anime', name: 'Anime' });
    fetchContent('anime');
  };

  const handleItemClick = (itemId) => {
    navigate(`/${contentType}/${itemId}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar 
        contentType={contentType}
        setContentType={setContentType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genres={genres}
        countries={countries}
        onHomeClick={handleHomeClick}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onAnimeClick={handleAnimeClick}
      />

      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        <ListPage 
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          contentType={contentType}
          currentEndpoint={currentEndpoint}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          searchTerm={searchTerm}
          selectedGenre={selectedGenre}
          selectedCountry={selectedCountry}
          onCategoryChange={handleCategoryChange}
          onItemClick={handleItemClick}
        />
      </Content>
    </Layout>
  );
};

export default HomePage;