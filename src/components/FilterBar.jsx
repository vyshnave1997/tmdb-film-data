// FilterBar.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Tag, Button, Space } from 'antd';

export const FilterBar = ({ 
  contentType, 
  currentEndpoint, 
  onCategoryChange 
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
        <Space size={8} style={{ display: 'flex', flexWrap: 'nowrap' }}>
          <Tag 
            color={contentType === 'movie' ? 'blue' : 'green'} 
            style={{ 
              fontSize: '12px', 
              padding: '4px 10px',
              whiteSpace: 'nowrap',
              margin: 0
            }}
          >
            {contentType === 'movie' ? 'Movies' : 'TV Shows'}
          </Tag>
          
          <Button
            size="small"
            type={currentEndpoint === 'popular' ? 'primary' : 'default'}
            onClick={() => onCategoryChange('popular')}
            style={{ whiteSpace: 'nowrap' }}
          >
            Popular
          </Button>
          
          <Button
            size="small"
            type={currentEndpoint === 'top_rated' ? 'primary' : 'default'}
            onClick={() => onCategoryChange('top_rated')}
            style={currentEndpoint === 'top_rated' ? { whiteSpace: 'nowrap' } : { 
              ...buttonStyle('top_rated', '#52c41a'),
              whiteSpace: 'nowrap'
            }}
          >
            Top Rated
          </Button>
          
          {contentType === 'movie' && (
            <>
              <Button
                size="small"
                type={currentEndpoint === 'upcoming' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('upcoming')}
                style={currentEndpoint === 'upcoming' ? { whiteSpace: 'nowrap' } : {
                  ...buttonStyle('upcoming', '#722ed1'),
                  whiteSpace: 'nowrap'
                }}
              >
                Upcoming
              </Button>
              
              <Button
                size="small"
                type={currentEndpoint === 'now_playing' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('now_playing')}
                danger={currentEndpoint !== 'now_playing'}
                style={{ whiteSpace: 'nowrap' }}
              >
                Now Playing
              </Button>
            </>
          )}
          
          {contentType === 'tv' && (
            <>
              <Button
                size="small"
                type={currentEndpoint === 'airing_today' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('airing_today')}
                style={currentEndpoint === 'airing_today' ? { whiteSpace: 'nowrap' } : {
                  ...buttonStyle('airing_today', '#722ed1'),
                  whiteSpace: 'nowrap'
                }}
              >
                Airing Today
              </Button>
              
              <Button
                size="small"
                type={currentEndpoint === 'on_the_air' ? 'primary' : 'default'}
                onClick={() => onCategoryChange('on_the_air')}
                danger={currentEndpoint !== 'on_the_air'}
                style={{ whiteSpace: 'nowrap' }}
              >
                On The Air
              </Button>
            </>
          )}
        </Space>
        <style jsx>{`
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
          color={contentType === 'movie' ? 'blue' : 'green'} 
          style={{ fontSize: '14px', padding: '4px 12px' }}
        >
          {contentType === 'movie' ? 'Movies' : 'TV Shows'}
        </Tag>
      </Col>
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
      {contentType === 'movie' && (
        <>
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
      {contentType === 'tv' && (
        <>
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