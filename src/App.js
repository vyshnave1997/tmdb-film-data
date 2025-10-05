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
  Badge,
  Dropdown,
  Menu,
  Modal,
  Tabs
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
  ArrowLeftOutlined,
  DownOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  YoutubeOutlined,
  LinkOutlined,
  DesktopOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { Meta } = Card;
const { TabPane } = Tabs;

const MovieDatabaseApp = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentEndpoint, setCurrentEndpoint] = useState('popular');
  const [hasMore, setHasMore] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [contentType, setContentType] = useState('movie');
  const [streamingModalVisible, setStreamingModalVisible] = useState(false);
  const [trailers, setTrailers] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);

  // TMDb API key (free API)
  const API_KEY = 'ffc5385a41a65394115a1346134c47f8';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
  const STREAMING_BASE_URL = 'https://moviesapi.to';

  // Fetch genres from TMDb API
  const fetchGenres = async (type = 'movie') => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  // Fetch countries from TMDb API
  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      const data = await response.json();
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  // Fetch trailers
  const fetchTrailers = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/${contentType}/${itemId}/videos?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) {
        throw new Error('Failed to fetch trailers');
      }
      const data = await response.json();
      const youtubeTrailers = data.results?.filter(video => 
        video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
      ) || [];
      setTrailers(youtubeTrailers);
    } catch (err) {
      console.error('Error fetching trailers:', err);
      setTrailers([]);
    }
  };

  // Fetch watch providers
  const fetchWatchProviders = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/${contentType}/${itemId}/watch/providers?api_key=${API_KEY}`);
      if (!response.ok) {
        throw new Error('Failed to fetch watch providers');
      }
      const data = await response.json();
      setWatchProviders(data.results || null);
    } catch (err) {
      console.error('Error fetching watch providers:', err);
      setWatchProviders(null);
    }
  };

  // Fetch content from TMDb API
  const fetchContent = async (endpoint = 'popular', page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      let url;
      if (endpoint.startsWith('genre-')) {
        const genreId = endpoint.split('-')[1];
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`;
      } else if (endpoint.startsWith('country-')) {
        const countryCode = endpoint.split('-')[1];
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_origin_country=${countryCode}&page=${page}&sort_by=popularity.desc`;
      } else {
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

  // Search content with pagination
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

  // Load more content (infinite scroll)
  const loadMoreContent = useCallback(() => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    
    if (currentEndpoint === 'search' && searchTerm) {
      searchContent(searchTerm, nextPage, false);
    } else {
      fetchContent(currentEndpoint, nextPage, false);
    }
  }, [currentPage, hasMore, loadingMore, currentEndpoint, searchTerm]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMoreContent();
    }
  }, [loadMoreContent]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fetch detailed information
  const fetchItemDetails = async (itemId) => {
    setLoading(true);
    setError('');
    try {
      const [itemResponse, creditsResponse] = await Promise.all([
        fetch(`${BASE_URL}/${contentType}/${itemId}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/${contentType}/${itemId}/credits?api_key=${API_KEY}`)
      ]);

      if (!itemResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch details');
      }

      const itemData = await itemResponse.json();
      const creditsData = await creditsResponse.json();

      setSelectedItem({
        ...itemData,
        cast: creditsData.cast?.slice(0, 10) || []
      });
      
      // Fetch trailers and watch providers
      await fetchTrailers(itemId);
      await fetchWatchProviders(itemId);
      
      setView('details');
    } catch (err) {
      setError(`Failed to load details: ${err.message}`);
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input with debouncing
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

  // Load popular content on component mount
  useEffect(() => {
    fetchContent('popular');
    fetchGenres(contentType);
    fetchCountries();
  }, []);

  // Handle content type change
  useEffect(() => {
    fetchGenres(contentType);
    setSelectedGenre(null);
    setSelectedCountry(null);
    setSearchTerm('');
    fetchContent('popular');
  }, [contentType]);

  // Handle category change
  const handleCategoryChange = (endpoint) => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedCountry(null);
    fetchContent(endpoint);
  };

  // Handle genre selection
  const handleGenreSelect = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    setSelectedGenre(genre);
    setSelectedCountry(null);
    setSearchTerm('');
    fetchContent(`genre-${genreId}`);
  };

  // Handle country selection
  const handleCountrySelect = (countryCode) => {
    const country = countries.find(c => c.iso_3166_1 === countryCode);
    setSelectedCountry(country);
    setSelectedGenre(null);
    setSearchTerm('');
    fetchContent(`country-${countryCode}`);
  };

  // Handle home click
  const handleHomeClick = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedCountry(null);
    fetchContent('popular');
  };

  // Open streaming modal
  const openStreamingModal = () => {
    setStreamingModalVisible(true);
  };

  const ContentCard = ({ item }) => (
    <Card
      hoverable
      style={{ marginBottom: 16 }}
      cover={
        item.poster_path ? (
          <Image
            alt={item.title || item.name}
            src={`${IMAGE_BASE_URL}${item.poster_path}`}
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
        <Badge count={item.vote_average?.toFixed(1)} color="gold">
          <StarFilled style={{ color: '#fadb14' }} />
        </Badge>
      ]}
      onClick={() => fetchItemDetails(item.id)}
    >
      <Meta
        title={item.title || item.name}
        description={
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CalendarOutlined /> {item.release_date || item.first_air_date}
            </Text>
            <Paragraph ellipsis={{ rows: 3 }} style={{ marginTop: 8, marginBottom: 0 }}>
              {item.overview}
            </Paragraph>
          </div>
        }
      />
    </Card>
  );

  const StreamingModal = () => {
    const tmdbId = selectedItem?.id;
    const streamingUrl = `${STREAMING_BASE_URL}/${contentType}/${tmdbId}`;
    const embedUrl = `${STREAMING_BASE_URL}/embed/${contentType}/${tmdbId}`;

    return (
      <Modal
        title={`Watch: ${selectedItem?.title || selectedItem?.name}`}
        open={streamingModalVisible}
        onCancel={() => setStreamingModalVisible(false)}
        width={900}
        footer={null}
      >
        <Tabs defaultActiveKey="1">
          {/* Option A: Official Trailers */}
          <TabPane 
            tab={
              <span>
                <YoutubeOutlined /> Official Trailers
              </span>
            } 
            key="1"
          >
            {trailers.length > 0 ? (
              <div>
                {trailers.map((trailer, index) => (
                  <div key={trailer.id} style={{ marginBottom: 16 }}>
                    <Title level={5}>{trailer.name}</Title>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        src={`https://www.youtube.com/embed/${trailer.key}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={trailer.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No trailers available" />
            )}
          </TabPane>

          {/* Option B: Legal Streaming Providers */}
          <TabPane 
            tab={
              <span>
                <GlobalOutlined /> Where to Watch
              </span>
            } 
            key="2"
          >
            {watchProviders && Object.keys(watchProviders).length > 0 ? (
              <div>
                <Alert
                  message="Legal Streaming Options"
                  description="These are official streaming platforms where you can watch this content legally."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                {Object.entries(watchProviders).slice(0, 5).map(([country, providers]) => (
                  <div key={country} style={{ marginBottom: 24 }}>
                    <Title level={5}>{country}</Title>
                    {providers.flatrate && providers.flatrate.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>Stream:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Space wrap>
                            {providers.flatrate.map(provider => (
                              <Card 
                                key={provider.provider_id}
                                size="small"
                                style={{ width: 100, textAlign: 'center' }}
                                cover={
                                  <img 
                                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    style={{ width: '100%', borderRadius: 8 }}
                                  />
                                }
                              >
                                <Text style={{ fontSize: 10 }}>{provider.provider_name}</Text>
                              </Card>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                    {providers.buy && providers.buy.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>Buy:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Space wrap>
                            {providers.buy.map(provider => (
                              <Card 
                                key={provider.provider_id}
                                size="small"
                                style={{ width: 100, textAlign: 'center' }}
                                cover={
                                  <img 
                                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    style={{ width: '100%', borderRadius: 8 }}
                                  />
                                }
                              >
                                <Text style={{ fontSize: 10 }}>{provider.provider_name}</Text>
                              </Card>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                    {providers.rent && providers.rent.length > 0 && (
                      <div>
                        <Text strong>Rent:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Space wrap>
                            {providers.rent.map(provider => (
                              <Card 
                                key={provider.provider_id}
                                size="small"
                                style={{ width: 100, textAlign: 'center' }}
                                cover={
                                  <img 
                                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    style={{ width: '100%', borderRadius: 8 }}
                                  />
                                }
                              >
                                <Text style={{ fontSize: 10 }}>{provider.provider_name}</Text>
                              </Card>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No streaming providers found for your region" />
            )}
          </TabPane>

          {/* Option C: External Streaming Link */}
          <TabPane 
            tab={
              <span>
                <LinkOutlined /> External Stream
              </span>
            } 
            key="3"
          >
            <Alert
              message="Third-Party Streaming"
              description="This opens an external streaming service. Please ensure you have the legal right to access this content in your region."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                block
                size="large"
                onClick={() => window.open(streamingUrl, '_blank')}
              >
                Open in New Tab
              </Button>
              <Divider>OR</Divider>
              <Text strong>Watch Embedded:</Text>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginTop: 8 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                  src={embedUrl}
                  allowFullScreen
                  title="External Stream"
                />
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  const ItemDetails = ({ item }) => (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Button 
        type="primary" 
        icon={<ArrowLeftOutlined />}
        onClick={() => setView('list')}
        style={{ marginBottom: 16 }}
      >
        Back to {contentType === 'movie' ? 'Movies' : 'TV Shows'}
      </Button>
      
      <Card>
        {item.backdrop_path && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <Image
              src={`${BACKDROP_BASE_URL}${item.backdrop_path}`}
              alt={item.title || item.name}
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
                {item.title || item.name}
              </Title>
              <Space>
                <Rate disabled defaultValue={item.vote_average / 2} allowHalf />
                <Text style={{ color: 'white' }}>
                  {item.vote_average?.toFixed(1)} / 10
                </Text>
              </Space>
            </div>
          </div>
        )}
        
        <Row gutter={24}>
          <Col xs={24} md={8}>
            {item.poster_path ? (
              <Image
                src={`${IMAGE_BASE_URL}${item.poster_path}`}
                alt={item.title || item.name}
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
            
            {/* Watch Now Buttons */}
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
              <Button 
                type="primary" 
                danger
                icon={<PlayCircleOutlined />}
                size="large"
                block
                onClick={openStreamingModal}
              >
                Watch Now
              </Button>
              {trailers.length > 0 && (
                <Button 
                  icon={<YoutubeOutlined />}
                  size="large"
                  block
                  onClick={() => {
                    setStreamingModalVisible(true);
                  }}
                >
                  View Trailers ({trailers.length})
                </Button>
              )}
            </Space>
          </Col>
          
          <Col xs={24} md={16}>
            {!item.backdrop_path && (
              <Title level={1}>{item.title || item.name}</Title>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {item.runtime && (
                <Col span={12} md={6}>
                  <Space>
                    <ClockCircleOutlined />
                    <Text>{item.runtime} min</Text>
                  </Space>
                </Col>
              )}
              {item.number_of_seasons && (
                <Col span={12} md={6}>
                  <Space>
                    <PlayCircleOutlined />
                    <Text>{item.number_of_seasons} Seasons</Text>
                  </Space>
                </Col>
              )}
              {item.number_of_episodes && (
                <Col span={12} md={6}>
                  <Space>
                    <PlayCircleOutlined />
                    <Text>{item.number_of_episodes} Episodes</Text>
                  </Space>
                </Col>
              )}
              {item.production_countries && item.production_countries.length > 0 && (
                <Col span={12} md={6}>
                  <Space>
                    <GlobalOutlined />
                    <Text>{item.production_countries[0]?.name}</Text>
                  </Space>
                </Col>
              )}
              {item.budget && item.budget > 0 && (
                <Col span={12} md={6}>
                  <Space>
                    <DollarOutlined />
                    <Text>${(item.budget / 1000000).toFixed(1)}M</Text>
                  </Space>
                </Col>
              )}
              {item.revenue && item.revenue > 0 && (
                <Col span={12} md={6}>
                  <Space>
                    <DollarOutlined style={{ color: '#52c41a' }} />
                    <Text>${(item.revenue / 1000000).toFixed(1)}M</Text>
                  </Space>
                </Col>
              )}
            </Row>

            {item.genres && item.genres.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Space wrap>
                  {item.genres.map((genre) => (
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
                {item.overview || 'No overview available.'}
              </Paragraph>
            </div>

            {item.cast && item.cast.length > 0 && (
              <div>
                <Title level={3}>
                  <TeamOutlined /> Cast
                </Title>
                <Row gutter={[16, 16]}>
                  {item.cast.slice(0, 10).map((actor) => (
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

  // Create genre menu
  const genreMenu = (
    <Menu
      style={{ maxHeight: '400px', overflowY: 'auto' }}
      onClick={({ key }) => handleGenreSelect(parseInt(key))}
    >
      {genres.map(genre => (
        <Menu.Item key={genre.id}>
          {genre.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  // Create country menu
  const countryMenu = (
    <Menu
      style={{ maxHeight: '400px', overflowY: 'auto' }}
      onClick={({ key }) => handleCountrySelect(key)}
    >
      {countries.map(country => (
        <Menu.Item key={country.iso_3166_1}>
          {country.english_name}
        </Menu.Item>
      ))}
    </Menu>
  );

  if (view === 'details' && selectedItem) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Content>
          <Spin spinning={loading} size="large">
            <ItemDetails item={selectedItem} />
            <StreamingModal />
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
              <a style={{ color: 'white', cursor: 'pointer' }} onClick={handleHomeClick}>
                <HomeOutlined /> Home
              </a>
              <Dropdown overlay={genreMenu} trigger={['click']}>
                <a style={{ color: 'white', cursor: 'pointer' }} onClick={e => e.preventDefault()}>
                  Genre <DownOutlined />
                </a>
              </Dropdown>
              <Dropdown overlay={countryMenu} trigger={['click']}>
                <a style={{ color: 'white', cursor: 'pointer' }} onClick={e => e.preventDefault()}>
                  Country <DownOutlined />
                </a>
              </Dropdown>
              <a 
                style={{ 
                  color: 'white', 
                  cursor: 'pointer',
                  fontWeight: contentType === 'movie' ? 'bold' : 'normal',
                  textDecoration: contentType === 'movie' ? 'underline' : 'none'
                }} 
                onClick={() => setContentType('movie')}
              >
                Movies
              </a>
              <a 
                style={{ 
                  color: 'white', 
                  cursor: 'pointer',
                  fontWeight: contentType === 'tv' ? 'bold' : 'normal',
                  textDecoration: contentType === 'tv' ? 'underline' : 'none'
                }} 
                onClick={() => setContentType('tv')}
              >
                TV Shows
              </a>
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
          <Row gutter={8} style={{ marginBottom: 24 }} align="middle">
            <Col>
              <Tag color={contentType === 'movie' ? 'blue' : 'green'} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {contentType === 'movie' ? 'Movies' : 'TV Shows'}
              </Tag>
            </Col>
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
            {contentType === 'movie' && (
              <>
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
              </>
            )}
            {contentType === 'tv' && (
              <>
                <Col>
                  <Button
                    type={currentEndpoint === 'airing_today' ? 'primary' : 'default'}
                    onClick={() => handleCategoryChange('airing_today')}
                    style={currentEndpoint === 'airing_today' ? {} : { backgroundColor: '#722ed1', borderColor: '#722ed1', color: 'white' }}
                  >
                    Airing Today
                  </Button>
                </Col>
                <Col>
                  <Button
                    type={currentEndpoint === 'on_the_air' ? 'primary' : 'default'}
                    onClick={() => handleCategoryChange('on_the_air')}
                    danger={currentEndpoint !== 'on_the_air'}
                  >
                    On The Air
                  </Button>
                </Col>
              </>
            )}
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
            {!loading && !error && items.length > 0 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    Showing {items.length} {contentType === 'movie' ? 'movies' : 'TV shows'}
                    {selectedGenre && ` in ${selectedGenre.name}`}
                    {selectedCountry && ` from ${selectedCountry.english_name}`}
                    {searchTerm && ` for "${searchTerm}"`}
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </Text>
                </div>

                <Row gutter={[16, 16]}>
                  {items.map((item) => (
                    <Col key={`${item.id}-${items.indexOf(item)}`} xs={24} sm={12} md={8} lg={6} xl={4}>
                      <ContentCard item={item} />
                    </Col>
                  ))}
                </Row>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Loading more {contentType === 'movie' ? 'movies' : 'TV shows'}...</Text>
                    </div>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && items.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Divider>
                      <Text type="secondary">No more {contentType === 'movie' ? 'movies' : 'TV shows'} to load</Text>
                    </Divider>
                  </div>
                )}
              </>
            )}

            {!loading && !error && items.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchTerm 
                    ? `No results for "${searchTerm}". Try a different search term.`
                    : `Click on a category button to load ${contentType === 'movie' ? 'movies' : 'TV shows'}`
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