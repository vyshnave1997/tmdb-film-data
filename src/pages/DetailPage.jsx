// DetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Modal, Button, Typography, Empty, Select, Card, Row, Col, Badge } from 'antd';
import { GlobalOutlined, FullscreenOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import DetailsPage from '../components/DetailsPage';
import RelatedContent from '../components/RelatedContent';
import { BASE_URL, API_KEY, STREAMING_SERVERS, getBestServer, getServersByType } from '../config';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState(type || 'movie');
  const [streamingModalVisible, setStreamingModalVisible] = useState(false);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [trailers, setTrailers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [autoPlayTrailer, setAutoPlayTrailer] = useState(false);
  const [activeServer, setActiveServer] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  

  const fetchGenres = async (contentTypeParam = 'movie') => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${contentTypeParam}/list?api_key=${API_KEY}&language=en-US`);
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

  // Fetch related/similar content
  const fetchRelatedContent = async (itemId, itemType) => {
    try {
      // Try recommendations first
      let response = await fetch(
        `${BASE_URL}/${itemType}/${itemId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
      );
      
      let data = { results: [] };
      if (response.ok) {
        data = await response.json();
      }

      // If no recommendations, try similar content
      if (!data.results || data.results.length === 0) {
        response = await fetch(
          `${BASE_URL}/${itemType}/${itemId}/similar?api_key=${API_KEY}&language=en-US&page=1`
        );
        if (response.ok) {
          data = await response.json();
        }
      }

      const related = data.results?.slice(0, 12) || [];
      console.log('Related content fetched:', related.length, 'items'); // Debug log
      setRelatedContent(related);
    } catch (err) {
      console.error('Error fetching related content:', err);
      setRelatedContent([]);
    }
  };

  const fetchTrailers = async (itemId, itemType) => {
    try {
      const response = await fetch(`${BASE_URL}/${itemType}/${itemId}/videos?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch trailers');
      const data = await response.json();
      const youtubeTrailers = data.results?.filter(
        video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
      ) || [];
      setTrailers(youtubeTrailers);
    } catch (err) {
      console.error('Error fetching trailers:', err);
      setTrailers([]);
    }
  };

  const fetchSeasonDetails = async (tvId, seasonNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch season details');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching season details:', err);
      return null;
    }
  };

  const fetchAllSeasons = async (tvId, seasonsList) => {
    try {
      const seasonPromises = seasonsList.map(season => fetchSeasonDetails(tvId, season.season_number));
      const seasonsData = await Promise.all(seasonPromises);
      setSeasons(seasonsData.filter(s => s !== null));
    } catch (err) {
      console.error('Error fetching all seasons:', err);
    }
  };

  const fetchItemDetails = async (itemId, itemType) => {
    setLoading(true);
    setError('');
    try {
      const [itemResponse, creditsResponse] = await Promise.all([
        fetch(`${BASE_URL}/${itemType}/${itemId}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/${itemType}/${itemId}/credits?api_key=${API_KEY}`)
      ]);

      if (!itemResponse.ok || !creditsResponse.ok) throw new Error('Failed to fetch details');

      const itemData = await itemResponse.json();
      const creditsData = await creditsResponse.json();

      setSelectedItem({
        ...itemData,
        cast: creditsData.cast?.slice(0, 10) || []
      });

      await fetchTrailers(itemId, itemType);
      await fetchRelatedContent(itemId, itemType);

      if (itemType === 'tv' && itemData.seasons) {
        await fetchAllSeasons(itemId, itemData.seasons);
      }
    } catch (err) {
      setError(`Failed to load details: ${err.message}`);
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && type) {
      setContentType(type);
      fetchItemDetails(id, type);
      fetchGenres(type);
      fetchCountries();
      
      // Auto-select best server for content type
      setActiveServer(getBestServer(type));

      setAutoPlayTrailer(false);
      const timer = setTimeout(() => setAutoPlayTrailer(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [id, type]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const landscape = window.innerHeight < window.innerWidth;
      
      setIsMobile(mobile);
      setIsLandscape(landscape);
    };

    const handleOrientationChange = (e) => {
      e.preventDefault();
      handleResize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Smart back navigation based on content type
  const handleBack = () => {
    // Check if content type is anime (genre 16 is Animation)
    const isAnime = selectedItem?.genres?.some(g => g.id === 16);
    
    if (type === 'movie') {
      navigate('/movies');
    } else if (type === 'tv') {
      if (isAnime) {
        navigate('/anime');
      } else {
        navigate('/tv-shows');
      }
    } else {
      navigate('/');
    }
  };

  const handleHomeClick = () => navigate('/');
  
  const handleGenreSelect = (genreId) => {
    // Navigate with genre filter
    if (type === 'movie') {
      navigate(`/movies?genre=${genreId}`);
    } else if (type === 'tv') {
      navigate(`/tv-shows?genre=${genreId}`);
    } else {
      navigate('/');
    }
  };
  
  const handleCountrySelect = (countryCode) => {
    // Navigate with country filter
    if (type === 'movie') {
      navigate(`/movies?country=${countryCode}`);
    } else if (type === 'tv') {
      navigate(`/tv-shows?country=${countryCode}`);
    } else {
      navigate('/');
    }
  };
  
  const handleAnimeClick = () => navigate('/anime');
  
  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    } else {
      navigate('/');
    }
  };

  const handleRelatedItemClick = (itemId) => {
    // Navigate to the related item detail page
    navigate(`/detail/${contentType}/${itemId}`);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleWatchClick = () => {
    if (contentType === 'tv') {
      if (seasons.length > 0 && seasons[0].episodes && seasons[0].episodes.length > 0) {
        setSelectedSeason(seasons[0]);
        setSelectedEpisode(seasons[0].episodes[0]);
      }
      setStreamingModalVisible(true);
    } else {
      setStreamingModalVisible(true);
    }
  };

  const handleEpisodeSelect = (season, episode) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    if (!streamingModalVisible) {
      setStreamingModalVisible(true);
    }
  };

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons(prev =>
      prev.includes(seasonNumber)
        ? prev.filter(s => s !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  const buildStreamUrl = (server, type, id, season, episode) => {
    // Use custom URL builder if server has one
    if (server.urlBuilder) {
      return server.urlBuilder(type, id, season, episode);
    }
    
    const serverUrl = server.url;
    
    if (type === 'tv' && season && episode) {
      if (serverUrl.includes('vidsrc.to')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (serverUrl.includes('vidsrc.me') || serverUrl.includes('vidsrc.xyz') || serverUrl.includes('vidsrc.pro')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (serverUrl.includes('moviesapi.club')) {
        return `${serverUrl}/tv/${id}-${season.season_number}-${episode.episode_number}`;
      } else if (serverUrl.includes('2embed.cc')) {
        return `${serverUrl}/tv/${id}?s=${season.season_number}&e=${episode.episode_number}`;
      } else if (serverUrl.includes('smashystream')) {
        return `${serverUrl}/tv/${id}?s=${season.season_number}&e=${episode.episode_number}`;
      } else if (serverUrl.includes('vidlink.pro')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      }
      return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
    } else if (type === 'movie') {
      if (serverUrl.includes('2embed.cc')) {
        return `${serverUrl}/${id}`;
      }
      return `${serverUrl}/movie/${id}`;
    }
    return '';
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      } else if (iframeRef.current.mozRequestFullScreen) {
        iframeRef.current.mozRequestFullScreen();
      } else if (iframeRef.current.msRequestFullscreen) {
        iframeRef.current.msRequestFullscreen();
      }
    }
  };

  const StreamingModal = () => {
    const tmdbId = selectedItem?.id;
    const streamingUrl = activeServer ? buildStreamUrl(activeServer, contentType, tmdbId, selectedSeason, selectedEpisode) : '';
    
    // Get available servers for current content type
    const availableServers = getServersByType(contentType);

    const getModalStyle = () => {
      if (isMobile && isLandscape) {
        return {
          top: 0,
          padding: 0,
          margin: 0,
          maxWidth: '100vw'
        };
      }
      return { top: isMobile ? 0 : 20 };
    };

    const getModalBodyStyle = () => {
      if (isMobile && isLandscape) {
        return {
          padding: 0,
          height: '100vh'
        };
      }
      return {
        padding: 0,
        height: isMobile ? '90vh' : '85vh',
        overflow: 'hidden'
      };
    };

    const handleServerChange = (serverName) => {
      const server = availableServers.find(s => s.name === serverName);
      if (server) {
        setActiveServer(server);
      }
    };

    const handleSeasonChange = (seasonNumber) => {
      const season = seasons.find(s => s.season_number === seasonNumber);
      if (season && season.episodes && season.episodes.length > 0) {
        setSelectedSeason(season);
        setSelectedEpisode(season.episodes[0]);
      }
    };

    return (
      <Modal
        title={
          !(isMobile && isLandscape) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '8px' 
            }}>
              <span style={{ 
                flex: isMobile ? '1 1 100%' : '1',
                fontSize: isMobile ? '14px' : '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {selectedItem?.title || selectedItem?.name}
                {selectedSeason && selectedEpisode &&
                  ` - S${selectedSeason.season_number}E${selectedEpisode.episode_number}`}
              </span>
              {!isMobile && (
                <Button
                  type="link"
                  icon={<GlobalOutlined />}
                  onClick={() => window.open(streamingUrl, '_blank')}
                >
                  Open in new tab
                </Button>
              )}
            </div>
          )
        }
        open={streamingModalVisible}
        onCancel={() => {
          setStreamingModalVisible(false);
        }}
        width="100vw"
        style={getModalStyle()}
        bodyStyle={getModalBodyStyle()}
        footer={null}
        closeIcon={!(isMobile && isLandscape)}
        maskClosable={false}
      >
        {!(isMobile && isLandscape) && (
          <div style={{ 
            padding: isMobile ? '8px 12px' : '12px 16px', 
            backgroundColor: '#fafafa', 
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px',
            flexWrap: 'wrap'
          }}>
            <strong style={{ 
              whiteSpace: 'nowrap',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              Server:
            </strong>
            <Select
              value={activeServer.name}
              onChange={handleServerChange}
              style={{ 
                minWidth: isMobile ? 150 : 200, 
                flex: 1,
                maxWidth: isMobile ? '200px' : 'none'
              }}
              size={isMobile ? 'small' : 'middle'}
              dropdownStyle={{ 
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              {STREAMING_SERVERS.map((server) => (
                <Option key={server.name} value={server.name}>
                  {server.name}
                </Option>
              ))}
            </Select>
            
            {/* Season Selector for TV Shows */}
            {contentType === 'tv' && seasons.length > 0 && (
              <>
                <strong style={{ 
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '13px' : '14px',
                  marginLeft: isMobile ? 0 : '12px'
                }}>
                  Season:
                </strong>
                <Select
                  value={selectedSeason?.season_number}
                  onChange={handleSeasonChange}
                  style={{ 
                    minWidth: isMobile ? 100 : 120,
                    maxWidth: isMobile ? '150px' : 'none'
                  }}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {seasons.map((season) => (
                    <Option key={season.season_number} value={season.season_number}>
                      Season {season.season_number}
                    </Option>
                  ))}
                </Select>
              </>
            )}
            
            {isMobile && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<FullscreenOutlined />}
                  onClick={handleFullscreen}
                  style={{ marginLeft: 'auto' }}
                >
                  Full
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<GlobalOutlined />}
                  onClick={() => window.open(streamingUrl, '_blank')}
                >
                  Tab
                </Button>
              </>
            )}
          </div>
        )}

        {isMobile && isLandscape && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <Select
              value={activeServer.name}
              onChange={handleServerChange}
              style={{ width: 140 }}
              size="small"
              dropdownStyle={{ fontSize: '12px' }}
            >
              {STREAMING_SERVERS.map((server) => (
                <Option key={server.name} value={server.name}>
                  {server.name.replace(/\s*\(.*?\)\s*/g, '')}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              size="small"
              icon={<FullscreenOutlined />}
              onClick={handleFullscreen}
            />
          </div>
        )}

        <div style={{ 
          display: 'flex',
          height: (isMobile && isLandscape) ? '100vh' : (isMobile ? 'calc(100% - 48px)' : 'calc(100% - 60px)'),
          overflow: 'hidden'
        }}>
          {/* Video Player */}
          <div style={{ 
            flex: contentType === 'tv' && selectedSeason ? (isMobile ? '1' : '2') : '1',
            height: '100%'
          }}>
            {streamingUrl ? (
              <iframe
                ref={iframeRef}
                key={streamingUrl}
                src={streamingUrl}
                allowFullScreen
                title="External Stream"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%', 
                color: '#999',
                flexDirection: 'column',
                padding: isMobile ? 16 : 20,
                textAlign: 'center'
              }}>
                <Empty description="Please select an episode to watch" />
                <p style={{ marginTop: 10, fontSize: isMobile ? '13px' : '14px' }}>
                  If the video doesn't load, try switching to another server
                </p>
              </div>
            )}
          </div>

          {/* Episode List for TV Shows */}
          {contentType === 'tv' && selectedSeason && !isMobile && (
            <div style={{
              flex: '1',
              overflowY: 'auto',
              borderLeft: '1px solid #e8e8e8',
              backgroundColor: '#fafafa',
              padding: '16px'
            }}>
              <Title level={5} style={{ marginBottom: '16px' }}>
                Season {selectedSeason.season_number} Episodes
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedSeason.episodes?.map((episode) => (
                  <Card
                    key={episode.episode_number}
                    size="small"
                    hoverable
                    onClick={() => handleEpisodeSelect(selectedSeason, episode)}
                    style={{
                      cursor: 'pointer',
                      border: selectedEpisode?.episode_number === episode.episode_number 
                        ? '2px solid #1890ff' 
                        : '1px solid #d9d9d9',
                      backgroundColor: selectedEpisode?.episode_number === episode.episode_number 
                        ? '#e6f7ff' 
                        : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {episode.still_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${episode.still_path}`}
                          alt={episode.name}
                          style={{
                            width: '80px',
                            height: '45px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          <Badge 
                            count={episode.episode_number} 
                            style={{ backgroundColor: '#1890ff', marginRight: '8px' }}
                          />
                          {episode.name}
                        </div>
                        {episode.runtime && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {episode.runtime} min
                          </div>
                        )}
                      </div>
                      {selectedEpisode?.episode_number === episode.episode_number && (
                        <PlayCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Episode List - Bottom Sheet Style */}
        {contentType === 'tv' && selectedSeason && isMobile && !(isMobile && isLandscape) && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '40%',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderTop: '2px solid #e8e8e8',
            padding: '12px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.15)'
          }}>
            <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>
              S{selectedSeason.season_number} Episodes
            </Title>
            <Row gutter={[8, 8]}>
              {selectedSeason.episodes?.map((episode) => (
                <Col span={12} key={episode.episode_number}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => handleEpisodeSelect(selectedSeason, episode)}
                    style={{
                      cursor: 'pointer',
                      border: selectedEpisode?.episode_number === episode.episode_number 
                        ? '2px solid #1890ff' 
                        : '1px solid #d9d9d9',
                      backgroundColor: selectedEpisode?.episode_number === episode.episode_number 
                        ? '#e6f7ff' 
                        : 'white'
                    }}
                    bodyStyle={{ padding: '8px' }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Ep {episode.episode_number}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {episode.name}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    );
  };

  const TrailerModal = () => {
    const mainTrailer = trailers.length > 0 ? trailers[0] : null;
    return (
      <Modal
        title={`Trailer: ${selectedItem?.title || selectedItem?.name}`}
        open={trailerModalVisible}
        onCancel={() => setTrailerModalVisible(false)}
        width={isMobile ? '95vw' : '90vw'}
        style={{ top: isMobile ? 20 : 20 }}
        bodyStyle={{ padding: isMobile ? 8 : 16 }}
        footer={null}
      >
        {mainTrailer ? (
          <div>
            {!isMobile && <Title level={5}>{mainTrailer.name}</Title>}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${mainTrailer.key}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={mainTrailer.name}
              />
            </div>
          </div>
        ) : (
          <Empty description="No trailers available" />
        )}
      </Modal>
    );
  };

  if (loading)
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#0f0f1e' }}>
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
        />
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );

  if (error)
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#0f0f1e' }}>
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
        />
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Empty description={error} />
        </Content>
      </Layout>
    );

  if (!selectedItem) return null;

  return (
    <Layout style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0f0f1e' }}>
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
      />
      <Content style={{ width: '100%', padding: 0 }}>
        <DetailsPage
          item={selectedItem}
          loading={loading}
          contentType={contentType}
          trailers={trailers}
          seasons={seasons}
          onBack={handleBack}
          onWatchClick={handleWatchClick}
          onTrailerClick={() => setTrailerModalVisible(true)}
          onEpisodeSelect={handleEpisodeSelect}
          autoPlayTrailer={autoPlayTrailer}
        />
        
        {/* Related Content Section */}
        {relatedContent && relatedContent.length > 0 && (
          <RelatedContent
            items={relatedContent}
            contentType={contentType}
            onItemClick={handleRelatedItemClick}
          />
        )}
        
        <StreamingModal />
        <TrailerModal />
      </Content>
    </Layout>
  );
};

export default DetailPage;