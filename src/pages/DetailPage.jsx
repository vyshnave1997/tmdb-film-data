// DetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Modal, Button, Typography, Empty } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import DetailsPage from '../components/DetailsPage';
import { BASE_URL, API_KEY, STREAMING_BASE_URL } from '../config';

const { Content } = Layout;
const { Title } = Typography;

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
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
  const [autoPlayTrailer, setAutoPlayTrailer] = useState(false);

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
      const youtubeTrailers = data.results?.filter(video => 
        video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
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
      const seasonPromises = seasonsList.map(season => 
        fetchSeasonDetails(tvId, season.season_number)
      );
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

      if (!itemResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch details');
      }

      const itemData = await itemResponse.json();
      const creditsData = await creditsResponse.json();

      setSelectedItem({
        ...itemData,
        cast: creditsData.cast?.slice(0, 10) || []
      });
      
      await fetchTrailers(itemId, itemType);

      // Fetch seasons only for TV shows
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
      
      // Reset autoplay state
      setAutoPlayTrailer(false);
      
      // Auto-play trailer after 5 seconds
      const timer = setTimeout(() => {
        setAutoPlayTrailer(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [id, type]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleGenreSelect = (genreId) => {
    navigate('/');
  };

  const handleCountrySelect = (countryCode) => {
    navigate('/');
  };

  const handleAnimeClick = () => {
    navigate('/');
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    navigate('/');
  };

  const handleWatchClick = () => {
    if (contentType === 'tv') {
      // For TV shows, open modal with first episode of first season pre-selected
      if (seasons.length > 0 && seasons[0].episodes && seasons[0].episodes.length > 0) {
        setSelectedSeason(seasons[0]);
        setSelectedEpisode(seasons[0].episodes[0]);
        setExpandedSeasons([seasons[0].season_number]); // Expand first season by default
      }
      setStreamingModalVisible(true);
    } else {
      // For movies, directly open streaming modal
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

  const StreamingModal = () => {
    const tmdbId = selectedItem?.id;
    let streamingUrl;

    if (contentType === 'tv' && selectedSeason && selectedEpisode) {
      streamingUrl = `${STREAMING_BASE_URL}/tv/${tmdbId}-${selectedSeason.season_number}-${selectedEpisode.episode_number}`;
    } else if (contentType === 'movie') {
      streamingUrl = `${STREAMING_BASE_URL}/movie/${tmdbId}`;
    } else {
      // Fallback if no episode selected for TV
      streamingUrl = '';
    }

    // Calculate modal body height for movies on mobile
    const getModalBodyStyle = () => {
      if (isMobile && contentType === 'movie') {
        // 65% of viewport height
        return {
          padding: 0,
          height: '65vh',
          maxHeight: '65vh'
        };
      }
      if (isMobile && contentType === 'tv') {
        return {
          padding: 0,
          height: '100vh'
        };
      }
      return {
        padding: 0,
        height: '80vh'
      };
    };

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              Watch: {selectedItem?.title || selectedItem?.name}
              {selectedSeason && selectedEpisode && 
                ` - S${selectedSeason.season_number}E${selectedEpisode.episode_number}: ${selectedEpisode.name}`
              }
            </span>
            {streamingUrl && (
              <Button 
                type="link" 
                icon={<GlobalOutlined />}
                onClick={() => window.open(streamingUrl, '_blank')}
              >
                Open in new tab 
              </Button>
            )}
          </div>
        }
        open={streamingModalVisible}
        onCancel={() => {
          setStreamingModalVisible(false);
          setSelectedSeason(null);
          setSelectedEpisode(null);
          setExpandedSeasons([]);
        }}
        width={isMobile ? "100vw" : "90vw"}
        style={{ 
          top: isMobile ? 0 : 20, 
          padding: isMobile ? 0 : undefined,
          maxWidth: isMobile ? '100vw' : undefined
        }}
        bodyStyle={getModalBodyStyle()}
        footer={null}
      >
        <div style={{ 
          display: 'flex', 
          height: '100%', 
          flexDirection: isMobile ? 'column' : 'row' 
        }}>
          {/* Season and Episode Selector - Left Side or Top on Mobile */}
          {contentType === 'tv' && seasons.length > 0 && (
            <div style={{ 
              width: isMobile ? '100%' : '300px',
              height: isMobile ? '40%' : 'auto',
              borderRight: isMobile ? 'none' : '1px solid #f0f0f0',
              borderBottom: isMobile ? '1px solid #f0f0f0' : 'none',
              overflowY: 'auto',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ padding: isMobile ? '12px' : '16px' }}>
                <Title level={5} style={{ marginBottom: isMobile ? '12px' : '16px', fontSize: isMobile ? '14px' : '16px' }}>Episodes</Title>
                {seasons.map((season) => {
                  const isExpanded = expandedSeasons.includes(season.season_number);
                  return (
                    <div key={season.id} style={{ marginBottom: isMobile ? '6px' : '8px' }}>
                      <div 
                        onClick={() => toggleSeason(season.season_number)}
                        style={{ 
                          fontWeight: 'bold', 
                          marginBottom: isExpanded ? (isMobile ? '6px' : '8px') : '0',
                          padding: isMobile ? '10px' : '12px',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          fontSize: isMobile ? '14px' : '16px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                        }}
                      >
                        <div>
                          <div>Season {season.season_number}</div>
                          {season.name && (
                            <div style={{ 
                              fontSize: isMobile ? '11px' : '12px', 
                              fontWeight: 'normal',
                              color: '#666',
                              marginTop: '4px'
                            }}>
                              {season.name}
                            </div>
                          )}
                        </div>
                        <span style={{ 
                          fontSize: isMobile ? '16px' : '18px',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                          display: 'inline-block'
                        }}>
                          ▼
                        </span>
                      </div>
                      {isExpanded && (
                        <div style={{ 
                          marginTop: isMobile ? '6px' : '8px',
                          paddingLeft: isMobile ? '4px' : '8px'
                        }}>
                          {season.episodes?.map((episode) => (
                            <div
                              key={episode.id}
                              onClick={() => handleEpisodeSelect(season, episode)}
                              style={{
                                padding: isMobile ? '6px 10px' : '8px 12px',
                                marginBottom: '4px',
                                cursor: 'pointer',
                                backgroundColor: 
                                  selectedSeason?.season_number === season.season_number && 
                                  selectedEpisode?.episode_number === episode.episode_number
                                    ? '#1890ff'
                                    : '#fff',
                                color: 
                                  selectedSeason?.season_number === season.season_number && 
                                  selectedEpisode?.episode_number === episode.episode_number
                                    ? '#fff'
                                    : '#000',
                                borderRadius: '4px',
                                transition: 'all 0.3s',
                              }}
                              onMouseEnter={(e) => {
                                if (!(selectedSeason?.season_number === season.season_number && 
                                      selectedEpisode?.episode_number === episode.episode_number)) {
                                  e.currentTarget.style.backgroundColor = '#e6f7ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!(selectedSeason?.season_number === season.season_number && 
                                      selectedEpisode?.episode_number === episode.episode_number)) {
                                  e.currentTarget.style.backgroundColor = '#fff';
                                }
                              }}
                            >
                              <div style={{ fontWeight: '500', fontSize: isMobile ? '13px' : '14px' }}>
                                Episode {episode.episode_number}
                              </div>
                              <div style={{ 
                                fontSize: isMobile ? '11px' : '12px', 
                                opacity: 0.8,
                                marginTop: '2px'
                              }}>
                                {episode.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Video Player - Right Side or Bottom on Mobile */}
          <div style={{ 
            flex: 1, 
            position: 'relative', 
            height: isMobile ? (contentType === 'tv' ? '60%' : '100%') : 'auto'
          }}>
            {streamingUrl ? (
              <iframe
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  display: 'block'
                }}
                src={streamingUrl}
                allowFullScreen
                title="External Stream"
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                fontSize: '16px',
                color: '#999'
              }}>
                Please select an episode to watch
              </div>
            )}
          </div>
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
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ padding: 16 }}
        footer={null}
      >
        {mainTrailer ? (
          <div>
            <Title level={5}>{mainTrailer.name}</Title>
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

  if (loading) {
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
  }

  if (error) {
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
  }

  if (!selectedItem) {
    return null;
  }

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