// FilterBar.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Tag, Button, Space, Segmented } from 'antd';
import { PlaySquareOutlined, VideoCameraOutlined } from '@ant-design/icons';

export const FilterBar = ({ 
  contentType, 
  currentEndpoint, 
  onCategoryChange,
  animeType = 'tv', // 'tv' or 'movie'
  onAnimeTypeChange // callback for anime type change
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttonStyle = (endpoint, color) => {
    if (currentEndpoint === endpoint) {
      return {};
    }
    return { 
      backgroundColor: color, 
      borderColor: color, 
      color: 'white' 
    };
  };

  // Get display name for content type
  const getContentTypeLabel = () => {
    if (contentType === 'anime') return 'Anime';
    if (contentType === 'movie') return 'Movies';
    return 'TV Shows';
  };

  // Get tag color
  const getTagColor = () => {
    if (contentType === 'anime') return 'purple';
    if (contentType === 'movie') return 'blue';
    return 'green';
  };

  // Mobile & Tablet View - Fixed Bottom with Horizontal Scroll
  if (isMobile) {
    return (
      <div style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #f0f0f0',
        padding: '12px 16px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <Space size={6} style={{ display: 'flex', flexWrap: 'nowrap' }}>
          <Tag 
            color={getTagColor()} 
            style={{ 
              fontSize: '14px', 
              padding: '6px 12px',
              whiteSpace: 'nowrap',
              margin: 0,
              height: '36px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {getContentTypeLabel()}
          </Tag>

          {/* Anime Type Toggle for Mobile */}
          {contentType === 'anime' && onAnimeTypeChange && (
            <Segmented
              options={[
                { label: 'Series', value: 'tv', icon: <PlaySquareOutlined /> },
                { label: 'Movies', value: 'movie', icon: <VideoCameraOutlined /> }
              ]}
              value={animeType}
              onChange={onAnimeTypeChange}
              style={{ 
                height: '36px',
                fontSize: '13px'
              }}
            />
          )}
          
          {/* Anime Specific Buttons - TV Series */}
          {contentType === 'anime' && animeType === 'tv' && (
            <>
              <Button
                size="middle"
                type={currentEndpoint === 'anime' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime')}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Popular
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'anime-top_rated' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-top_rated')}
                style={currentEndpoint === 'anime-top_rated' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : { 
                  ...buttonStyle('anime-top_rated', '#52c41a'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Top Rated
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'anime-airing_today' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-airing_today')}
                style={currentEndpoint === 'anime-airing_today' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : {
                  ...buttonStyle('anime-airing_today', '#722ed1'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Airing Today
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'anime-on_the_air' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-on_the_air')}
                danger={currentEndpoint !== 'anime-on_the_air'}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                On The Air
              </Button>
            </>
          )}

          {/* Anime Specific Buttons - Movies */}
          {contentType === 'anime' && animeType === 'movie' && (
            <>
              <Button
                size="middle"
                type={currentEndpoint === 'anime-movie-popular' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-movie-popular')}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Popular
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'anime-movie-top_rated' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-movie-top_rated')}
                style={currentEndpoint === 'anime-movie-top_rated' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : { 
                  ...buttonStyle('anime-movie-top_rated', '#52c41a'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Top Rated
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'anime-movie-upcoming' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-movie-upcoming')}
                style={currentEndpoint === 'anime-movie-upcoming' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : {
                  ...buttonStyle('anime-movie-upcoming', '#722ed1'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Upcoming
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'anime-movie-now_playing' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('anime-movie-now_playing')}
                danger={currentEndpoint !== 'anime-movie-now_playing'}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Now Playing
              </Button>
            </>
          )}
          
          {/* Movie Buttons */}
          {contentType === 'movie' && (
            <>
              <Button
                size="middle"
                type={currentEndpoint === 'popular' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('popular')}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Popular
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'top_rated' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('top_rated')}
                style={currentEndpoint === 'top_rated' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : { 
                  ...buttonStyle('top_rated', '#52c41a'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Top Rated
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'upcoming' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('upcoming')}
                style={currentEndpoint === 'upcoming' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : {
                  ...buttonStyle('upcoming', '#722ed1'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Upcoming
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'now_playing' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('now_playing')}
                danger={currentEndpoint !== 'now_playing'}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Now Playing
              </Button>
            </>
          )}
          
          {/* TV Show Buttons */}
          {contentType === 'tv' && (
            <>
              <Button
                size="middle"
                type={currentEndpoint === 'popular' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('popular')}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Popular
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'top_rated' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('top_rated')}
                style={currentEndpoint === 'top_rated' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : { 
                  ...buttonStyle('top_rated', '#52c41a'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Top Rated
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'airing_today' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('airing_today')}
                style={currentEndpoint === 'airing_today' ? { 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                } : {
                  ...buttonStyle('airing_today', '#722ed1'),
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                Airing Today
              </Button>
              
              <Button
                size="middle"
                type={currentEndpoint === 'on_the_air' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('on_the_air')}
                danger={currentEndpoint !== 'on_the_air'}
                style={{ 
                  whiteSpace: 'nowrap',
                  height: '36px',
                  fontSize: '14px',
                  padding: '0 16px'
                }}
              >
                On The Air
              </Button>
            </>
          )}
        </Space>
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  }

  // Desktop View - Normal Layout
  return (
    <Row gutter={8} style={{ marginBottom: 24 }} align="middle">
      <Col>
        <Tag 
          color={getTagColor()} 
          style={{ fontSize: '14px', padding: '4px 12px' }}
        >
          {getContentTypeLabel()}
        </Tag>
      </Col>

      {/* Anime Type Toggle for Desktop */}
      {contentType === 'anime' && onAnimeTypeChange && (
        <Col>
          <Segmented
            options={[
              { label: 'Series', value: 'tv', icon: <PlaySquareOutlined /> },
              { label: 'Movies', value: 'movie', icon: <VideoCameraOutlined /> }
            ]}
            value={animeType}
            onChange={onAnimeTypeChange}
          />
        </Col>
      )}
      
      {/* Anime Specific Buttons - TV Series */}
      {contentType === 'anime' && animeType === 'tv' && (
        <>
          <Col>
            <Button
              type={currentEndpoint === 'anime' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime')}
            >
              Popular
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'anime-top_rated' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-top_rated')}
              style={buttonStyle('anime-top_rated', '#52c41a')}
            >
              Top Rated
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'anime-airing_today' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-airing_today')}
              style={buttonStyle('anime-airing_today', '#722ed1')}
            >
              Airing Today
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'anime-on_the_air' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-on_the_air')}
              danger={currentEndpoint !== 'anime-on_the_air'}
            >
              On The Air
            </Button>
          </Col>
        </>
      )}

      {/* Anime Specific Buttons - Movies */}
      {contentType === 'anime' && animeType === 'movie' && (
        <>
          <Col>
            <Button
              type={currentEndpoint === 'anime-movie-popular' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-movie-popular')}
            >
              Popular
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'anime-movie-top_rated' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-movie-top_rated')}
              style={buttonStyle('anime-movie-top_rated', '#52c41a')}
            >
              Top Rated
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'anime-movie-upcoming' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-movie-upcoming')}
              style={buttonStyle('anime-movie-upcoming', '#722ed1')}
            >
              Upcoming
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'anime-movie-now_playing' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('anime-movie-now_playing')}
              danger={currentEndpoint !== 'anime-movie-now_playing'}
            >
              Now Playing
            </Button>
          </Col>
        </>
      )}
      
      {/* Movie Buttons */}
      {contentType === 'movie' && (
        <>
          <Col>
            <Button
              type={currentEndpoint === 'popular' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('popular')}
            >
              Popular
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'top_rated' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('top_rated')}
              style={buttonStyle('top_rated', '#52c41a')}
            >
              Top Rated
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'upcoming' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('upcoming')}
              style={buttonStyle('upcoming', '#722ed1')}
            >
              Upcoming
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'now_playing' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('now_playing')}
              danger={currentEndpoint !== 'now_playing'}
            >
              Now Playing
            </Button>
          </Col>
        </>
      )}
      
      {/* TV Show Buttons */}
      {contentType === 'tv' && (
        <>
          <Col>
            <Button
              type={currentEndpoint === 'popular' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('popular')}
            >
              Popular
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'top_rated' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('top_rated')}
              style={buttonStyle('top_rated', '#52c41a')}
            >
              Top Rated
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'airing_today' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('airing_today')}
              style={buttonStyle('airing_today', '#722ed1')}
            >
              Airing Today
            </Button>
          </Col>
          <Col>
            <Button
              type={currentEndpoint === 'on_the_air' ? 'primary' : 'default'}
              onClick={() => onCategoryChange('on_the_air')}
              danger={currentEndpoint !== 'on_the_air'}
            >
              On The Air
            </Button>
          </Col>
        </>
      )}
    </Row>
  );
};

export default FilterBar;