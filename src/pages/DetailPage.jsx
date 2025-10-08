// DetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Modal, Button, Typography, Empty, Select } from 'antd';
import { GlobalOutlined, FullscreenOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import DetailsPage from '../components/DetailsPage';
import { BASE_URL, API_KEY, STREAMING_SERVERS } from '../config';

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
  const [activeServer, setActiveServer] = useState(STREAMING_SERVERS[0]);

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

      setAutoPlayTrailer(false);
      const timer = setTimeout(() => setAutoPlayTrailer(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [id, type]);

  // Prevent page refresh on orientation change
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const landscape = window.innerHeight < window.innerWidth;
      
      setIsMobile(mobile);
      setIsLandscape(landscape);
    };

    // Prevent orientation change from reloading
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

  const handleBack = () => navigate('/');
  const handleHomeClick = () => navigate('/');
  const handleGenreSelect = () => navigate('/');
  const handleCountrySelect = () => navigate('/');
  const handleAnimeClick = () => navigate('/');
  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    navigate('/');
  };

  const handleWatchClick = () => {
    if (contentType === 'tv') {
      if (seasons.length > 0 && seasons[0].episodes && seasons[0].episodes.length > 0) {
        setSelectedSeason(seasons[0]);
        setSelectedEpisode(seasons[0].episodes[0]);
        setExpandedSeasons([seasons[0].season_number]);
      }
      setStreamingModalVisible(true);
    } else {
      setStreamingModalVisible(true);
    }
  };

  const handleEpisodeSelect = (season, episode) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setStreamingModalVisible(true);
  };

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons(prev =>
      prev.includes(seasonNumber)
        ? prev.filter(s => s !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  // Enhanced buildStreamUrl function
  const buildStreamUrl = (server, type, id, season, episode) => {
    const serverUrl = server.url;
    
    if (type === 'tv' && season && episode) {
      // TV Show URL patterns
      if (serverUrl.includes('vidsrc.to')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (serverUrl.includes('moviesapi.club')) {
        return `${serverUrl}/tv/${id}-${season.season_number}-${episode.episode_number}`;
      } else if (serverUrl.includes('2embed.cc')) {
        return `${serverUrl}/tv/${id}?s=${season.season_number}&e=${episode.episode_number}`;
      } else if (serverUrl.includes('vidsrc.me')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (serverUrl.includes('smashystream')) {
        return `${serverUrl}/tv/${id}?s=${season.season_number}&e=${episode.episode_number}`;
      }
      return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
    } else if (type === 'movie') {
      // Movie URL patterns
      if (serverUrl.includes('2embed.cc')) {
        return `${serverUrl}/${id}`;
      }
      return `${serverUrl}/movie/${id}`;
    }
    return '';
  };

  // Toggle fullscreen for iframe
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

  // Mobile-friendly Streaming Modal
  const StreamingModal = () => {
    const tmdbId = selectedItem?.id;
    const streamingUrl = buildStreamUrl(activeServer, contentType, tmdbId, selectedSeason, selectedEpisode);

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
        height: isMobile ? '90vh' : '80vh'
      };
    };

    const handleServerChange = (serverName) => {
      const server = STREAMING_SERVERS.find(s => s.name === serverName);
      if (server) {
        setActiveServer(server);
      }
    };

    return (
      <Modal
        title={
          // Hide title in landscape mobile mode for more screen space
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
          setSelectedSeason(null);
          setSelectedEpisode(null);
          setExpandedSeasons([]);
        }}
        width={isMobile ? '100vw' : '90vw'}
        style={getModalStyle()}
        bodyStyle={getModalBodyStyle()}
        footer={null}
        closeIcon={!(isMobile && isLandscape)}
        maskClosable={false}
      >
        {/* Server Selector - Mobile Optimized */}
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

        {/* Floating controls for landscape mode */}
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

        {/* Video Player */}
        <div style={{ 
          height: (isMobile && isLandscape) ? '100vh' : (isMobile ? 'calc(100% - 48px)' : 'calc(100% - 60px)')
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
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
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
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
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
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
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
      <Content>
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
        <StreamingModal />
        <TrailerModal />
      </Content>
    </Layout>
  );
};

export default DetailPage;