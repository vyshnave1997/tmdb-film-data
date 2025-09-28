import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Row, 
  Col, 
  Spin, 
  Alert, 
  Typography, 
  Rate, 
  Tag, 
  Avatar, 
  Divider, 
  Space,
  Layout,
  Image,
  Empty,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  StarFilled, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  VideoCameraOutlined,
  GlobalOutlined,
  DollarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { Meta } = Card;

const MovieDatabaseApp = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentEndpoint, setCurrentEndpoint] = useState('popular');
  const [hasMore, setHasMore] = useState(true);

  // TMDb API key (free API)
  const API_KEY = 'ffc5385a41a65394115a1346134c47f8';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

  // Fetch movies from TMDb API
  const fetchMovies = async (endpoint = 'popular', page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key error. Please check the configuration.');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setMovies(data.results || []);
      } else {
        setMovies(prevMovies => [...prevMovies, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
      setHasMore(page < (data.total_pages || 1));
      
      if (reset) {
        setCurrentEndpoint(endpoint);
      }
    } catch (err) {
      setError(`Failed to load movies: ${err.message}`);
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search movies with pagination
  const searchMovies = async (query, page = 1, reset = true) => {
    if (!query.trim()) {
      fetchMovies('popular');
      return;
    }

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setMovies(data.results || []);
      } else {
        setMovies(prevMovies => [...prevMovies, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
      setHasMore(page < (data.total_pages || 1));
      
      if (reset) {
        setCurrentEndpoint('search');
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error('Error searching movies:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more movies (infinite scroll)
  const loadMoreMovies = useCallback(() => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    
    if (currentEndpoint === 'search' && searchTerm) {
      searchMovies(searchTerm, nextPage, false);
    } else {
      fetchMovies(currentEndpoint, nextPage, false);
    }
  }, [currentPage, hasMore, loadingMore, currentEndpoint, searchTerm]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMoreMovies();
    }
  }, [loadMoreMovies]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fetch detailed movie information
  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    setError('');
    try {
      const [movieResponse, creditsResponse] = await Promise.all([
        fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`)
      ]);

      if (!movieResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch movie details');
      }

      const movieData = await movieResponse.json();
      const creditsData = await creditsResponse.json();

      setSelectedMovie({
        ...movieData,
        cast: creditsData.cast?.slice(0, 10) || []
      });
      setView('details');
    } catch (err) {
      setError(`Failed to load movie details: ${err.message}`);
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchMovies(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load popular movies on component mount
  useEffect(() => {
    fetchMovies('popular');
  }, []);

  // Handle category change
  const handleCategoryChange = (endpoint) => {
    setSearchTerm('');
    fetchMovies(endpoint);
  };

  const MovieCard = ({ movie }) => (
    <Card
      hoverable
      style={{ marginBottom: 16 }}
      cover={
        movie.poster_path ? (
          <Image
            alt={movie.title}
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            height={300}
            style={{ objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            <VideoCameraOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          </div>
        )
      }
      actions={[
        <Badge count={movie.vote_average?.toFixed(1)} color="gold">
          <StarFilled style={{ color: '#fadb14' }} />
        </Badge>
      ]}
      onClick={() => fetchMovieDetails(movie.id)}
    >
      <Meta
        title={movie.title}
        description={
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CalendarOutlined /> {movie.release_date}
            </Text>
            <Paragraph ellipsis={{ rows: 3 }} style={{ marginTop: 8, marginBottom: 0 }}>
              {movie.overview}
            </Paragraph>
          </div>
        }
      />
    </Card>
  );

  const MovieDetails = ({ movie }) => (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Button 
        type="primary" 
        icon={<ArrowLeftOutlined />}
        onClick={() => setView('list')}
        style={{ marginBottom: 16 }}
      >
        Back to Movies
      </Button>
      
      <Card>
        {movie.backdrop_path && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <Image
              src={`${BACKDROP_BASE_URL}${movie.backdrop_path}`}
              alt={movie.title}
              width="100%"
              height={300}
              style={{ objectFit: 'cover', borderRadius: 8 }}
            />
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}>
              <Title level={1} style={{ color: 'white', margin: 0 }}>
                {movie.title}
              </Title>
              <Space>
                <Rate disabled defaultValue={movie.vote_average / 2} allowHalf />
                <Text style={{ color: 'white' }}>
                  {movie.vote_average?.toFixed(1)} / 10
                </Text>
              </Space>
            </div>
          </div>
        )}
        
        <Row gutter={24}>
          <Col xs={24} md={8}>
            {movie.poster_path ? (
              <Image
                src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                alt={movie.title}
                width="100%"
                style={{ borderRadius: 8 }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: 400, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <VideoCameraOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              </div>
            )}
          </Col>
          
          <Col xs={24} md={16}>
            {!movie.backdrop_path && (
              <Title level={1}>{movie.title}</Title>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {movie.runtime && (
                <Col span={12} md={6}>
                  <Space>
                    <ClockCircleOutlined />
                    <Text>{movie.runtime} min</Text>
                  </Space>
                </Col>
              )}
              {movie.production_countries && movie.production_countries.length > 0 && (
                <Col span={12} md={6}>
                  <Space>
                    <GlobalOutlined />
                    <Text>{movie.production_countries[0]?.name}</Text>
                  </Space>
                </Col>
              )}
              {movie.budget && movie.budget > 0 && (
                <Col span={12} md={6}>
                  <Space>
                    <DollarOutlined />
                    <Text>${(movie.budget / 1000000).toFixed(1)}M</Text>
                  </Space>
                </Col>
              )}
              {movie.revenue && movie.revenue > 0 && (
                <Col span={12} md={6}>
                  <Space>
                    <DollarOutlined style={{ color: '#52c41a' }} />
                    <Text>${(movie.revenue / 1000000).toFixed(1)}M</Text>
                  </Space>
                </Col>
              )}
            </Row>

            {movie.genres && movie.genres.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Space wrap>
                  {movie.genres.map((genre) => (
                    <Tag key={genre.id} color="blue">
                      {genre.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <Title level={3}>Overview</Title>
              <Paragraph>
                {movie.overview || 'No overview available.'}
              </Paragraph>
            </div>

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <Title level={3}>
                  <TeamOutlined /> Cast
                </Title>
                <Row gutter={[16, 16]}>
                  {movie.cast.slice(0, 10).map((actor) => (
                    <Col key={actor.id} xs={12} sm={8} md={6} lg={4}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        {actor.profile_path ? (
                          <Avatar
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            size={64}
                            style={{ marginBottom: 8 }}
                          />
                        ) : (
                          <Avatar
                            icon={<TeamOutlined />}
                            size={64}
                            style={{ marginBottom: 8, backgroundColor: '#f5f5f5', color: '#d9d9d9' }}
                          />
                        )}
                        <div>
                          <Text strong style={{ fontSize: '12px' }}>
                            {actor.name}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {actor.character}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );

  if (view === 'details' && selectedMovie) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Content>
          <Spin spinning={loading} size="large">
            <MovieDetails movie={selectedMovie} />
          </Spin>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
<Header style={{ backgroundColor: '#3f5f7f', padding: '0 40px' }}>
  <Row justify="space-between" align="middle" style={{ height: '64px' }}>
    {/* Logo */}
    <Col>
      <Space align="center">
        <VideoCameraOutlined style={{ fontSize: 28, color: 'orange' }} />
      </Space>
    </Col>

    {/* Navigation Links */}
    <Col flex="auto">
      <Space size="large" style={{ marginLeft: 40 }}>
        <a style={{ color: 'white' }}>Home</a>
        <a style={{ color: 'white' }}>Genre</a>
        <a style={{ color: 'white' }}>Country</a>
        <a style={{ color: 'white' }}>Movies</a>
        <a style={{ color: 'white' }}>TV Shows</a>
        <a style={{ color: 'white' }}>Top IMDB</a>
        <a style={{ color: 'white' }}>Android App</a>
      </Space>
    </Col>

    {/* Search Bar */}
    <Col xs={24} md={8}>
      <Search
        placeholder="Enter keywords..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        enterButton
        size="large"
        style={{
          borderRadius: '30px',
          marginTop: '8px',
          overflow: 'hidden',
          background: 'white',
        }}
      />
    </Col>
  </Row>
</Header>



      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Row gutter={8} style={{ marginBottom: 24 }}>
            <Col>
              <Button
                type={currentEndpoint === 'popular' ? 'primary' : 'default'}
                onClick={() => handleCategoryChange('popular')}
              >
                Popular
              </Button>
            </Col>
            <Col>
              <Button
                type={currentEndpoint === 'top_rated' ? 'primary' : 'default'}
                onClick={() => handleCategoryChange('top_rated')}
                style={currentEndpoint === 'top_rated' ? {} : { backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              >
                Top Rated
              </Button>
            </Col>
            <Col>
              <Button
                type={currentEndpoint === 'upcoming' ? 'primary' : 'default'}
                onClick={() => handleCategoryChange('upcoming')}
                style={currentEndpoint === 'upcoming' ? {} : { backgroundColor: '#722ed1', borderColor: '#722ed1', color: 'white' }}
              >
                Upcoming
              </Button>
            </Col>
            <Col>
              <Button
                type={currentEndpoint === 'now_playing' ? 'primary' : 'default'}
                onClick={() => handleCategoryChange('now_playing')}
                danger={currentEndpoint !== 'now_playing'}
              >
                Now Playing
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert
              message="Error"
              description={
                <div>
                  <p>{error}</p>
                  <p>Please check your internet connection and try again.</p>
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Spin spinning={loading} size="large">
            {!loading && !error && movies.length > 0 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    Showing {movies.length} movies
                    {searchTerm && ` for "${searchTerm}"`}
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </Text>
                </div>

                <Row gutter={[16, 16]}>
                  {movies.map((movie) => (
                    <Col key={`${movie.id}-${movies.indexOf(movie)}`} xs={24} sm={12} md={8} lg={6} xl={4}>
                      <MovieCard movie={movie} />
                    </Col>
                  ))}
                </Row>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Loading more movies...</Text>
                    </div>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && movies.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Divider>
                      <Text type="secondary">No more movies to load</Text>
                    </Divider>
                  </div>
                )}
              </>
            )}

            {!loading && !error && movies.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchTerm 
                    ? `No results for "${searchTerm}". Try a different search term.`
                    : 'Click on a category button to load movies'
                }
              />
            )}
          </Spin>
        </div>
      </Content>
    </Layout>
  );
};

export default MovieDatabaseApp;