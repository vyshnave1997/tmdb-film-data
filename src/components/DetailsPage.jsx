// DetailsPage.jsx
import React, { useState } from 'react';
import { Card, Button, Row, Col, Space, Typography, Rate, Tag, Avatar, Image } from 'antd';
import { 
  ArrowLeftOutlined, 
  ClockCircleOutlined, 
  GlobalOutlined, 
  DollarOutlined,
  PlayCircleOutlined,
  YoutubeOutlined,
  TeamOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { IMAGE_BASE_URL, BACKDROP_BASE_URL } from '../config';

const { Title, Text, Paragraph } = Typography;

export const DetailsPage = ({ 
  item, 
  loading,
  contentType,
  trailers,
  onBack,
  onWatchClick,
  onTrailerClick
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const mainTrailer = trailers.length > 0 ? trailers[0] : null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Button 
        type="primary" 
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Back to {contentType === 'movie' ? 'Movies' : 'TV Shows'}
      </Button>
      
      <Card>
        {item.backdrop_path && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            {showTrailer && mainTrailer ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }}
                  src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={mainTrailer.name}
                />
                <Button
                  style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                  onClick={() => setShowTrailer(false)}
                >
                  Show Backdrop
                </Button>
              </div>
            ) : (
              <>
                <Image
                  src={`${BACKDROP_BASE_URL}${item.backdrop_path}`}
                  alt={item.title || item.name}
                  width="100%"
                  height={300}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  preview={false}
                />
                {mainTrailer && (
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<PlayCircleOutlined />}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      padding: '24px 48px',
                      height: 'auto',
                      fontSize: '18px'
                    }}
                    onClick={() => setShowTrailer(true)}
                  >
                    Play Trailer
                  </Button>
                )}
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
              </>
            )}
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
            
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
              <Button 
                type="primary" 
                danger
                icon={<PlayCircleOutlined />}
                size="large"
                block
                onClick={onWatchClick}
              >
                Watch Now
              </Button>
              {trailers.length > 0 && (
                <Button 
                  icon={<YoutubeOutlined />}
                  size="large"
                  block
                  onClick={onTrailerClick}
                >
                  View Trailer
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
};

export default DetailsPage;