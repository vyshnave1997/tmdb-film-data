// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Spin, Typography, Button, Carousel } from 'antd';
import { ArrowRightOutlined, PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import ContentCard from '../components/ContentCard';
import { BASE_URL, API_KEY, BACKDROP_BASE_URL } from '../config';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [contentType, setContentType] = useState('movie');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [heroItems, setHeroItems] = useState([]);
  const [recentReleases, setRecentReleases] = useState([]);
  const [recentReleasesPage, setRecentReleasesPage] = useState(1);
  const [recentReleasesVisible, setRecentReleasesVisible] = useState(16);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularMoviesVisible, setPopularMoviesVisible] = useState(16);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedMoviesVisible, setTopRatedMoviesVisible] = useState(16);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [popularTVVisible, setPopularTVVisible] = useState(16);
  const [animeShows, setAnimeShows] = useState([]);
  const [animeVisible, setAnimeVisible] = useState(16);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [upcomingTV, setUpcomingTV] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const fetchHeroItems = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      setHeroItems(data.results?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching hero items:', err);
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      setUpcomingMovies(data.results?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching upcoming movies:', err);
    }
  };

  const fetchUpcomingTV = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${today}&page=1`
      );
      const data = await response.json();
      setUpcomingTV(data.results?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching upcoming TV:', err);
    }
  };

  const fetchUpcomingAnime = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc&first_air_date.gte=${today}&page=1`
      );
      const data = await response.json();
      setUpcomingAnime(data.results?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching upcoming anime:', err);
    }
  };

  const fetchRecentReleases = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      const moviesResponse = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${formatDate(thirtyDaysAgo)}&primary_release_date.lte=${formatDate(today)}&page=1`
      );
      const moviesData = await moviesResponse.json();
      
      const tvResponse = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${formatDate(thirtyDaysAgo)}&first_air_date.lte=${formatDate(today)}&page=1`
      );
      const tvData = await tvResponse.json();
      
      const animeResponse = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc&first_air_date.gte=${formatDate(thirtyDaysAgo)}&first_air_date.lte=${formatDate(today)}&page=1`
      );
      const animeData = await animeResponse.json();
      
      const combined = [
        ...(moviesData.results?.slice(0, 10).map(item => ({ ...item, media_type: 'movie' })) || []),
        ...(tvData.results?.slice(0, 10).map(item => ({ ...item, media_type: 'tv' })) || []),
        ...(animeData.results?.slice(0, 10).map(item => ({ ...item, media_type: 'tv' })) || [])
      ].sort((a, b) => b.popularity - a.popularity);
      
      setRecentReleases(combined);
    } catch (err) {
      console.error('Error fetching recent releases:', err);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      setPopularMovies(data.results || []);
    } catch (err) {
      console.error('Error fetching popular movies:', err);
    }
  };

  const fetchTopRatedMovies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      setTopRatedMovies(data.results || []);
    } catch (err) {
      console.error('Error fetching top rated movies:', err);
    }
  };

  const fetchPopularTVShows = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      setPopularTVShows(data.results || []);
    } catch (err) {
      console.error('Error fetching popular TV shows:', err);
    }
  };

  const fetchAnimeShows = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`
      );
      const data = await response.json();
      setAnimeShows(data.results || []);
    } catch (err) {
      console.error('Error fetching anime shows:', err);
    }
  };

  useEffect(() => {
    fetchGenres(contentType);
    fetchCountries();
    
    const loadAllContent = async () => {
      setLoading(true);
      await Promise.all([
        fetchHeroItems(),
        fetchRecentReleases(),
        fetchPopularMovies(),
        fetchTopRatedMovies(),
        fetchPopularTVShows(),
        fetchAnimeShows(),
        fetchUpcomingMovies(),
        fetchUpcomingTV(),
        fetchUpcomingAnime()
      ]);
      setLoading(false);
    };
    
    loadAllContent();
  }, []);

  const handleItemClick = (id, mediaType) => {
    const type = mediaType || 'movie';
    navigate(`/detail/${type}/${id}`);
  };

  const handleGenreSelect = (genreId) => {
    if (contentType === 'movie') {
      navigate(`/movies?genre=${genreId}`);
    } else {
      navigate(`/tv-shows?genre=${genreId}`);
    }
  };

  const handleCountrySelect = (countryCode) => {
    if (contentType === 'movie') {
      navigate(`/movies?country=${countryCode}`);
    } else {
      navigate(`/tv-shows?country=${countryCode}`);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
    setSearchTerm('');
    setSearchResults(null);
  };

  const handleAnimeClick = () => {
    navigate('/anime');
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    }
  };

  const handleGlobalSearch = async (query, searchType) => {
    if (!query.trim()) {
      setSearchResults(null);
      setSearchTerm('');
      return;
    }

    setIsSearching(true);
    setSearchResults({ movies: [], tvShows: [], people: [] });

    try {
      const moviesResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );
      const moviesData = await moviesResponse.json();

      const tvResponse = await fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );
      const tvData = await tvResponse.json();

      const peopleResponse = await fetch(
        `${BASE_URL}/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );
      const peopleData = await peopleResponse.json();

      setSearchResults({
        movies: moviesData.results?.slice(0, 16) || [],
        tvShows: tvData.results?.slice(0, 16) || [],
        people: peopleData.results?.slice(0, 8) || []
      });
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const HeroSection = () => (
    <div style={{ marginBottom: '48px', marginTop: '-88px', marginLeft: '-24px', marginRight: '-24px' }}>
      <Carousel autoplay autoplaySpeed={5000} arrows={false} dots={false}>
        {heroItems.map((item) => (
          <div key={item.id}>
            <div style={{
              position: 'relative',
              height: '100vh',
              backgroundImage: `url(${BACKDROP_BASE_URL}${item.backdrop_path || item.poster_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              paddingTop: window.innerWidth <= 768 ? '64px' : '80px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: window.innerWidth <= 768 ? '40px' : '80px',
                  left: window.innerWidth <= 768 ? '20px' : '60px',
                  maxWidth: window.innerWidth <= 768 ? '90%' : '600px',
                  color: 'white'
                }}>
                  <Title level={window.innerWidth <= 768 ? 3 : 1} style={{ color: 'white', marginBottom: '16px' }}>
                    {item.title || item.name}
                  </Title>
                  {!window.innerWidth <= 768 && (
                    <Paragraph style={{ 
                      color: 'white', 
                      fontSize: '16px', 
                      marginBottom: '24px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.overview}
                    </Paragraph>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button 
                      type="primary" 
                      size={window.innerWidth <= 768 ? 'middle' : 'large'}
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleItemClick(item.id, 'movie')}
                    >
                      Watch Now
                    </Button>
                    <Button 
                      size={window.innerWidth <= 768 ? 'middle' : 'large'}
                      icon={<InfoCircleOutlined />}
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}
                      onClick={() => handleItemClick(item.id, 'movie')}
                    >
                      More Info
                    </Button>
                  </div>
                  {item.release_date && (
                    <div style={{ 
                      marginTop: '16px', 
                      fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                      opacity: 0.8 
                    }}>
                      Coming: {new Date(item.release_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );

  const UpcomingBanner = ({ items, type, title }) => {
    if (!items || items.length === 0) return null;
    
    // Hide on mobile
    if (window.innerWidth <= 768) return null;
    
    return (
      <div style={{ 
        marginBottom: '48px',
        padding: window.innerWidth <= 768 ? '20px' : '32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>
          🎬 {title}
        </Title>
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={12} sm={12} md={6} lg={6} key={item.id}>
              <div 
                onClick={() => handleItemClick(item.id, type)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s',
                  ':hover': { transform: 'scale(1.05)' }
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  style={{ 
                    width: '100%', 
                    height: window.innerWidth <= 768 ? '200px' : '300px',
                    objectFit: 'cover' 
                  }}
                />
                <div style={{ padding: '12px' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.title || item.name}
                  </div>
                  {(item.release_date || item.first_air_date) && (
                    <div style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px', opacity: 0.8, marginTop: '4px' }}>
                      {new Date(item.release_date || item.first_air_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const ContentSection = ({ title, items, onSeeMore, type, visibleCount, onLoadMore, hideViewAll }) => (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
      </div>
      
      <Row gutter={[16, 16]}>
        {items.slice(0, visibleCount).map((item) => (
          <Col xs={12} sm={8} md={6} lg={6} xl={3} key={item.id}>
            <ContentCard
              item={item}
              contentType={type || item.media_type}
              onClick={() => handleItemClick(item.id, type || item.media_type)}
            />
          </Col>
        ))}
      </Row>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '24px',
        gap: '12px'
      }}>
        {visibleCount < items.length && (
          <Button 
            type="default"
            size="large"
            onClick={onLoadMore}
          >
            Load 10 More
          </Button>
        )}
        {!hideViewAll && (
          <Button 
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={onSeeMore}
          >
            See All
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar 
          contentType={contentType}
          setContentType={handleContentTypeChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genres={genres}
          countries={countries}
          onHomeClick={handleHomeClick}
          onGenreSelect={handleGenreSelect}
          onCountrySelect={handleCountrySelect}
          onAnimeClick={handleAnimeClick}
          onSearch={handleGlobalSearch}
        />
        <Content style={{ 
          padding: '24px', 
          backgroundColor: '#f0f2f5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          <Spin size="large" tip="Loading content..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar 
        contentType={contentType}
        setContentType={handleContentTypeChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genres={genres}
        countries={countries}
        onHomeClick={handleHomeClick}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onAnimeClick={handleAnimeClick}
        onSearch={handleGlobalSearch}
      />

      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        {!searchResults && <HeroSection />}
        
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" tip="Searching..." />
            </div>
          ) : searchResults ? (
            <>
              {searchResults.movies.length > 0 && (
                <ContentSection
                  title={`Movie Results (${searchResults.movies.length})`}
                  items={searchResults.movies}
                  onSeeMore={() => navigate('/movies')}
                  type="movie"
                />
              )}
              
              {searchResults.tvShows.length > 0 && (
                <ContentSection
                  title={`TV Show Results (${searchResults.tvShows.length})`}
                  items={searchResults.tvShows}
                  onSeeMore={() => navigate('/tv-shows')}
                  type="tv"
                />
              )}

              {searchResults.people.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                  <Title level={3}>People Results ({searchResults.people.length})</Title>
                  <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                    {searchResults.people.map((person) => (
                      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={person.id}>
                        <div
                          style={{
                            textAlign: 'center',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <img
                            src={
                              person.profile_path
                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                : 'https://via.placeholder.com/185x278?text=No+Image'
                            }
                            alt={person.name}
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              marginBottom: '8px'
                            }}
                          />
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {person.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {person.known_for_department}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {searchResults.movies.length === 0 && 
               searchResults.tvShows.length === 0 && 
               searchResults.people.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Title level={4}>No results found for "{searchTerm}"</Title>
                  <Button type="primary" onClick={() => {
                    setSearchTerm('');
                    setSearchResults(null);
                  }}>
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <ContentSection
                title="Recent Releases"
                items={recentReleases}
                onSeeMore={() => navigate('/movies')}
                type={null}
                visibleCount={recentReleasesVisible}
                onLoadMore={() => setRecentReleasesVisible(prev => prev + 10)}
                hideViewAll={true}
              />

              <ContentSection
                title="Popular Movies"
                items={popularMovies}
                onSeeMore={() => navigate('/movies')}
                type="movie"
                visibleCount={popularMoviesVisible}
                onLoadMore={() => setPopularMoviesVisible(prev => prev + 10)}
              />

              <UpcomingBanner 
                items={upcomingMovies} 
                type="movie" 
                title="Upcoming Movies - Coming Soon"
              />

              <ContentSection
                title="Top Rated Movies"
                items={topRatedMovies}
                onSeeMore={() => navigate('/movies')}
                type="movie"
                visibleCount={topRatedMoviesVisible}
                onLoadMore={() => setTopRatedMoviesVisible(prev => prev + 10)}
              />

              <ContentSection
                title="Popular TV Shows"
                items={popularTVShows}
                onSeeMore={() => navigate('/tv-shows')}
                type="tv"
                visibleCount={popularTVVisible}
                onLoadMore={() => setPopularTVVisible(prev => prev + 10)}
              />

              <UpcomingBanner 
                items={upcomingTV} 
                type="tv" 
                title="Upcoming TV Shows - New Seasons"
              />

              <ContentSection
                title="Anime"
                items={animeShows}
                onSeeMore={() => navigate('/anime')}
                type="tv"
                visibleCount={animeVisible}
                onLoadMore={() => setAnimeVisible(prev => prev + 10)}
              />

              <UpcomingBanner 
                items={upcomingAnime} 
                type="tv" 
                title="Upcoming Anime - New Releases"
              />
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;