// MoviesPage.jsx - With Proper Combined Filter Logic
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';
import ListPage from '../components/ListPage';
import FilterBar from '../components/FilterBar';
import ActiveFilters from '../components/ActiveFilters';
import { BASE_URL, API_KEY } from '../config';
import { useContentManager } from '../hooks/useContentManager';

const { Content } = Layout;

const STORAGE_KEY = 'moviesPageState';

const MoviesPage = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  
  // Try to restore previous state
  const getSavedState = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedState = getSavedState();
  const [searchTerm, setSearchTerm] = useState(savedState?.searchTerm || '');
  const [isRestoringState, setIsRestoringState] = useState(!!savedState);

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
      return data.genres || [];
    } catch (err) {
      console.error('Error fetching genres:', err);
      return [];
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching countries:', err);
      return [];
    }
  };

  // Save state whenever it changes
  useEffect(() => {
    if (!isRestoringState) {
      const stateToSave = {
        searchTerm,
        selectedGenreId: selectedGenre?.id,
        selectedCountryCode: selectedCountry?.iso_3166_1,
        currentEndpoint,
        scrollPosition: window.scrollY
      };
      
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error('Error saving state:', err);
      }
    }
  }, [searchTerm, selectedGenre, selectedCountry, currentEndpoint, isRestoringState]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      const genresList = await fetchGenres();
      const countriesList = await fetchCountries();
      
      if (savedState) {
        // Restore all filters
        if (savedState.selectedGenreId) {
          const genre = genresList.find(g => g.id === savedState.selectedGenreId);
          if (genre) setSelectedGenre(genre);
        }
        
        if (savedState.selectedCountryCode) {
          const country = countriesList.find(c => c.iso_3166_1 === savedState.selectedCountryCode);
          if (country) setSelectedCountry(country);
        }

        // Construct endpoint based on filters
        if (savedState.searchTerm) {
          searchContent(savedState.searchTerm);
        } else if (savedState.selectedGenreId && savedState.selectedCountryCode) {
          fetchContent(`genre-${savedState.selectedGenreId}-country-${savedState.selectedCountryCode}`);
        } else if (savedState.selectedGenreId) {
          fetchContent(`genre-${savedState.selectedGenreId}`);
        } else if (savedState.selectedCountryCode) {
          fetchContent(`country-${savedState.selectedCountryCode}`);
        } else if (savedState.currentEndpoint) {
          fetchContent(savedState.currentEndpoint);
        } else {
          fetchContent('popular');
        }

        // Restore scroll position
        if (savedState.scrollPosition) {
          setTimeout(() => {
            window.scrollTo(0, savedState.scrollPosition);
            setIsRestoringState(false);
          }, 300);
        } else {
          setIsRestoringState(false);
        }
      } else {
        fetchContent('popular');
        setIsRestoringState(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // UPDATED: Combined filter logic with proper search handling
  useEffect(() => {
    if (!isRestoringState && searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        // Search with ALL active filters combined
        searchContent(searchTerm, selectedGenre, selectedCountry);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (!isRestoringState && !searchTerm.trim() && (selectedGenre || selectedCountry)) {
      // If search is cleared but filters exist, fetch with those filters
      handleClearSearch();
    }
  }, [searchTerm, isRestoringState]);

  const handleCategoryChange = (endpoint) => {
    // Clear search when changing category
    setSearchTerm('');
    
    // Maintain genre and country filters with category change
    if (selectedCountry && selectedGenre) {
      fetchContent(`${endpoint}-country-${selectedCountry.iso_3166_1}-genre-${selectedGenre.id}`);
    } else if (selectedCountry) {
      fetchContent(`${endpoint}-country-${selectedCountry.iso_3166_1}`);
    } else if (selectedGenre) {
      fetchContent(`${endpoint}-genre-${selectedGenre.id}`);
    } else {
      fetchContent(endpoint);
    }
  };

  const handleGenreSelect = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    setSelectedGenre(genre);
    
    // UPDATED: Apply genre filter along with search and country
    if (searchTerm.trim()) {
      // If searching, search with new genre + existing country
      searchContent(searchTerm, genre, selectedCountry);
    } else if (selectedCountry) {
      // If country selected, show country + genre
      fetchContent(`country-${selectedCountry.iso_3166_1}-genre-${genreId}`);
    } else {
      // Just show genre
      fetchContent(`genre-${genreId}`);
    }
  };

  const handleCountrySelect = (countryCode) => {
    const country = countries.find(c => c.iso_3166_1 === countryCode);
    setSelectedCountry(country);
    
    // UPDATED: Apply country filter along with search and genre
    if (searchTerm.trim()) {
      // If searching, search with new country + existing genre
      searchContent(searchTerm, selectedGenre, country);
    } else if (selectedGenre) {
      // If genre selected, show country + genre
      fetchContent(`country-${countryCode}-genre-${selectedGenre.id}`);
    } else {
      // Just show country
      fetchContent(`country-${countryCode}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // After clearing search, show results based on remaining filters
    if (selectedCountry && selectedGenre) {
      fetchContent(`country-${selectedCountry.iso_3166_1}-genre-${selectedGenre.id}`);
    } else if (selectedCountry) {
      fetchContent(`country-${selectedCountry.iso_3166_1}`);
    } else if (selectedGenre) {
      fetchContent(`genre-${selectedGenre.id}`);
    } else {
      fetchContent('popular');
    }
  };

  const handleClearGenre = () => {
    setSelectedGenre(null);
    // UPDATED: Maintain search and country after clearing genre
    if (searchTerm.trim()) {
      // Re-search with country but no genre
      searchContent(searchTerm, null, selectedCountry);
    } else if (selectedCountry) {
      fetchContent(`country-${selectedCountry.iso_3166_1}`);
    } else {
      fetchContent('popular');
    }
  };

  const handleClearCountry = () => {
    setSelectedCountry(null);
    // UPDATED: Maintain search and genre after clearing country
    if (searchTerm.trim()) {
      // Re-search with genre but no country
      searchContent(searchTerm, selectedGenre, null);
    } else if (selectedGenre) {
      fetchContent(`genre-${selectedGenre.id}`);
    } else {
      fetchContent('popular');
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedCountry(null);
    fetchContent('popular');
  };

  const handleHomeClick = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  const handleAnimeClick = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/anime');
  };

  const handleContentTypeChange = (newType) => {
    sessionStorage.removeItem(STORAGE_KEY);
    if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    }
  };

  const handleMovieClick = (id) => {
    navigate(`/detail/movie/${id}`);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/movies') && !currentPath.includes('/detail/movie')) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    };
  }, []);

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
        {!searchTerm && !selectedGenre && !selectedCountry && (
          <FilterBar 
            contentType="movie"
            currentEndpoint={currentEndpoint}
            onCategoryChange={handleCategoryChange}
          />
        )}
        
        <ActiveFilters
          searchTerm={searchTerm}
          selectedGenre={selectedGenre}
          selectedCountry={selectedCountry}
          onClearSearch={handleClearSearch}
          onClearGenre={handleClearGenre}
          onClearCountry={handleClearCountry}
          onClearAll={handleClearAllFilters}
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