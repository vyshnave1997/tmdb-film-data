// RelatedContent.jsx
import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { StarFilled } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Meta } = Card;

const RelatedContent = ({ items, contentType, onItemClick }) => {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: '40px 24px',
          background: 'linear-gradient(180deg, #0f0f1e 0%, #16213e 100%)',
          minHeight: '200px',
          textAlign: 'center',
        }}
      >
        <Empty
          description="No related content available"
          style={{ color: '#999' }}
        />
      </div>
    );
  }

  const getImageUrl = (item) => {
    return item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : 'https://via.placeholder.com/342x513?text=No+Image';
  };

  const getTitle = (item) => {
    return item.title || item.name || 'Unknown';
  };

  const getReleaseYear = (item) => {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
  };

  const getContentTypeLabel = () => {
    if (contentType === 'movie') return 'Related Movies';
    if (contentType === 'tv') return 'Related TV Shows';
    return 'You May Also Like';
  };

  return (
    <div
      style={{
        padding: '40px 24px',
        background: 'linear-gradient(180deg, #0f0f1e 0%, #16213e 100%)',
        minHeight: '400px',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <Title
          level={2}
          style={{
            color: '#fff',
            marginBottom: '30px',
            fontSize: '28px',
            fontWeight: 'bold',
            borderBottom: '3px solid #ff6b6b',
            paddingBottom: '12px',
            display: 'inline-block',
          }}
        >
          {getContentTypeLabel()}
        </Title>

        <div
          className="related-scroll"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: '#ff6b6b #1a1a2e',
            paddingBottom: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '16px',
              minWidth: 'min-content',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="related-card"
                style={{
                  minWidth: '200px',
                  maxWidth: '200px',
                  flexShrink: 0,
                }}
              >
                <Card
                  hoverable
                  cover={
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img
                        alt={getTitle(item)}
                        src={getImageUrl(item)}
                        style={{
                          width: '100%',
                          height: '300px',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = 'scale(1.05)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = 'scale(1)')
                        }
                      />
                      {item.vote_average > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <StarFilled
                            style={{ color: '#ffd700', fontSize: '12px' }}
                          />
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.vote_average.toFixed(1)}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                  onClick={() => onItemClick(item.id)}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #16213e',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    height: '100%',
                  }}
                  bodyStyle={{
                    padding: '12px',
                    background: '#1a1a2e',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 16px rgba(255, 107, 107, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Meta
                    title={
                      <Text
                        ellipsis={{ rows: 2 }}
                        style={{
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '500',
                          lineHeight: '1.4',
                          minHeight: '40px',
                          display: 'block',
                        }}
                      >
                        {getTitle(item)}
                      </Text>
                    }
                    description={
                      <div style={{ marginTop: '8px' }}>
                        <Text style={{ color: '#999', fontSize: '12px' }}>
                          {getReleaseYear(item)}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          /* Scrollbar styling */
          .related-scroll::-webkit-scrollbar {
            height: 8px;
          }
          .related-scroll::-webkit-scrollbar-track {
            background: #1a1a2e;
            border-radius: 4px;
          }
          .related-scroll::-webkit-scrollbar-thumb {
            background: #ff6b6b;
            border-radius: 4px;
          }
          .related-scroll::-webkit-scrollbar-thumb:hover {
            background: #ee5a6f;
          }

          /* 🔹 Mobile Responsive Tweaks */
          @media (max-width: 768px) {
            .related-card {
              min-width: 140px !important;
              max-width: 140px !important;
            }
            .related-card img {
              height: 220px !important;
            }
            .related-scroll {
              gap: 10px !important;
            }
            h2.ant-typography {
              font-size: 20px !important;
            }
            .ant-card-meta-title {
              font-size: 12px !important;
            }
          }

          @media (max-width: 480px) {
            .related-card {
              min-width: 120px !important;
              max-width: 120px !important;
            }
            .related-card img {
              height: 180px !important;
            }
            h2.ant-typography {
              font-size: 18px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default RelatedContent;
