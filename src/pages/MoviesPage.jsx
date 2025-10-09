// MoviesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';
import ListPage from '../components/ListPage';
import FilterBar from '../components/FilterBar';
import { BASE_URL, API_KEY } from '../config';
import { useContentManager } from '../hooks/useContentManager';

const { Content } = Layout;

const MoviesPage = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    items,
    loading,
    loadingMore,
    error,
    currentPage,
    totalPages,
    hasMore,
    currentEndpoint,
    selectedGenre,
    selectedCountry,
    fetchContent,
    searchContent,
    handleScroll,
    setSelectedGenre,
    setSelectedCountry
  } = useContentManager('movies', 'movie');

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
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

  useEffect(() => {
    fetchGenres();
    fetchCountries();
  }, []);

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
    navigate('/');
  };

  const handleAnimeClick = () => {
    navigate('/anime');
  };

  const handleContentTypeChange = (newType) => {
    if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    }
  };

  // Handle movie click - navigate to detail page
  const handleMovieClick = (id) => {
    navigate(`/detail/movie/${id}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar 
        contentType="movie"
        setContentType={handleContentTypeChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genres={genres}
        countries={countries}
        onHomeClick={handleHomeClick}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onAnimeClick={handleAnimeClick}
      />

      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5', paddingBottom: '80px' }}>
        <FilterBar 
          contentType="movie"
          currentEndpoint={currentEndpoint}
          onCategoryChange={handleCategoryChange}
        />
        
        <ListPage 
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          contentType="movie"
          currentEndpoint={currentEndpoint}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          searchTerm={searchTerm}
          selectedGenre={selectedGenre}
          selectedCountry={selectedCountry}
          onCategoryChange={handleCategoryChange}
          onItemClick={handleMovieClick}
        />
      </Content>
    </Layout>
  );
};

export default MoviesPage;