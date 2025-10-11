// Enhanced Navbar.jsx with horizontal dropdown for genres and countries

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Space, Input, Dropdown, Menu, Drawer, Button, Avatar, AutoComplete, Spin, Empty, Modal } from 'antd';
import { 
  HomeOutlined, 
  DownOutlined, 
  MenuOutlined,
  SearchOutlined,
  CloseOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { BASE_URL, API_KEY } from '../config';

const { Search } = Input;
const { Header } = Layout;

export const Navbar = ({ 
  searchTerm, 
  setSearchTerm, 
  genres, 
  countries,
  onGenreSelect,
  onCountrySelect,
  onSearch,
  onHomeClick,
  onAnimeClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailPage = location.pathname.includes('/detail/');
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(searchTerm);
  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dropdown search results
  const fetchDropdownResults = async (query) => {
    if (!query.trim()) {
      setAutocompleteOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const [moviesRes, tvRes, peopleRes] = await Promise.all([
        fetch(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        ),
        fetch(
          `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        ),
        fetch(
          `${BASE_URL}/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        )
      ]);

      const moviesData = await moviesRes.json();
      const tvData = await tvRes.json();
      const peopleData = await peopleRes.json();

      const movies = moviesData.results?.slice(0, 5) || [];
      const tvShows = tvData.results?.slice(0, 5) || [];
      const people = peopleData.results?.slice(0, 5) || [];

      const options = [];

      // Movies section
      if (movies.length > 0) {
        options.push({
          label: (
            <div style={{ 
              color: '#ff6b6b', 
              fontWeight: 'bold', 
              fontSize: '12px',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              MOVIES
            </div>
          ),
          options: movies.map(movie => ({
            value: `movie-${movie.id}`,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    style={{ height: '30px', borderRadius: '4px' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>
                    {movie.title}
                  </div>
                  {movie.release_date && (
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                  )}
                </div>
              </div>
            ),
            type: 'movie',
            id: movie.id
          }))
        });
      }

      // TV Shows section
      if (tvShows.length > 0) {
        options.push({
          label: (
            <div style={{ 
              color: '#ff6b6b', 
              fontWeight: 'bold', 
              fontSize: '12px',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              TV SHOWS
            </div>
          ),
          options: tvShows.map(tvShow => ({
            value: `tv-${tvShow.id}`,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {tvShow.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${tvShow.poster_path}`}
                    alt={tvShow.name}
                    style={{ height: '30px', borderRadius: '4px' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>
                    {tvShow.name}
                  </div>
                  {tvShow.first_air_date && (
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {new Date(tvShow.first_air_date).getFullYear()}
                    </div>
                  )}
                </div>
              </div>
            ),
            type: 'tv',
            id: tvShow.id
          }))
        });
      }

      // People section
      if (people.length > 0) {
        options.push({
          label: (
            <div style={{ 
              color: '#ff6b6b', 
              fontWeight: 'bold', 
              fontSize: '12px',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              ACTORS & CREW
            </div>
          ),
          options: people.map(person => ({
            value: `person-${person.id}`,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {person.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                    alt={person.name}
                    style={{ 
                      height: '30px', 
                      width: '30px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Avatar size={30} style={{ backgroundColor: '#ff6b6b' }}>
                    {person.name.charAt(0)}
                  </Avatar>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>
                    {person.name}
                  </div>
                  {person.known_for_department && (
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {person.known_for_department}
                    </div>
                  )}
                </div>
              </div>
            ),
            type: 'person',
            id: person.id
          }))
        });
      }

      setAutocompleteOptions(options);
    } catch (err) {
      console.error('Error searching:', err);
      setAutocompleteOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSelect = (value) => {
    const [type, id] = value.split('-');
    
    if (type === 'person') {
      // For people, you could navigate to a person page or perform a search
      handleSearch(searchInputValue);
    } else {
      // Navigate to detail page for movie/tv
      navigate(`/detail/${type}/${id}`);
      setSearchInputValue('');
      setAutocompleteOptions([]);
    }
  };

  const handleSearch = (value) => {
    if (!value.trim()) return;

    const pathToType = {
      '/': 'all',
      '/movies': 'movie',
      '/tv-shows': 'tv',
      '/anime': 'tv'
    };

    if (onSearch) {
      onSearch(value, pathToType[location.pathname] || 'all');
    }
    setSearchInputValue('');
    setAutocompleteOptions([]);
  };

  const handleSearchInputChange = (value) => {
    setSearchInputValue(value);
    setSearchTerm(value);
    fetchDropdownResults(value);
  };

  const currentPath = location.pathname || '/';

  const getSearchPlaceholder = () => {
    if (currentPath === '/movies') {
      return 'Search movies, actors...';
    } else if (currentPath === '/tv-shows') {
      return 'Search TV shows, actors...';
    } else if (currentPath === '/anime') {
      return 'Search anime, actors...';
    } else {
      return 'Search movies, shows, anime, actors...';
    }
  };

  const genreMenu = (
    <Menu 
      style={{ 
        background: '#1a1a2e',
        border: '1px solid #16213e',
        borderRadius: '8px',
        minWidth: isMobile ? '250px' : '600px',
        maxWidth: isMobile ? '90vw' : '800px',
        maxHeight: isMobile ? '70vh' : '400px',
        overflowY: 'auto',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
      }}
    >
      {isMobile ? (
        // Vertical list for mobile
        genres?.map(genre => (
          <Menu.Item 
            key={genre.id}
            onClick={() => {
              onGenreSelect(parseInt(genre.id));
              setDrawerVisible(false);
            }}
            style={{
              color: '#ffffff',
              padding: '12px 20px',
              margin: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              fontSize: '14px'
            }}
          >
            <span style={{ color: '#ffffff' }}>{genre.name}</span>
          </Menu.Item>
        ))
      ) : (
        // Grid layout for desktop
        <div style={{ padding: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px'
          }}>
            {genres?.map(genre => (
              <div
                key={genre.id}
                onClick={() => {
                  onGenreSelect(parseInt(genre.id));
                  setDrawerVisible(false);
                }}
                style={{
                  color: '#e0e0e0',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid transparent',
                  transition: 'all 0.3s ease',
                  fontSize: '13px',
                  textAlign: 'center',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)';
                  e.currentTarget.style.borderColor = '#ff6b6b';
                  e.currentTarget.style.color = '#ff6b6b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = '#e0e0e0';
                }}
              >
                {genre.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </Menu>
  );

  // Priority countries (most popular for movies/TV)
  const priorityCountries = ['US', 'GB', 'KR', 'JP', 'IN', 'FR', 'CA', 'DE', 'ES', 'IT', 'CN', 'HK', 'TH', 'MX', 'BR', 'AU'];
  
  const sortedCountries = countries ? [...countries].sort((a, b) => {
    const aIndex = priorityCountries.indexOf(a.iso_3166_1);
    const bIndex = priorityCountries.indexOf(b.iso_3166_1);
    
    // If both are priority countries, sort by priority order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only a is priority, it comes first
    if (aIndex !== -1) return -1;
    // If only b is priority, it comes first
    if (bIndex !== -1) return 1;
    // Otherwise, sort alphabetically
    return a.english_name.localeCompare(b.english_name);
  }) : [];

  const countryMenu = (
    <div
      style={{ 
        background: '#1a1a2e',
        border: '1px solid #16213e',
        borderRadius: '8px',
        padding: '16px',
        minWidth: isMobile ? '280px' : '600px',
        maxWidth: isMobile ? '320px' : '800px',
        maxHeight: '400px',
        overflowY: 'auto',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '8px'
      }}>
        {sortedCountries.map((country, index) => {
          const isPriority = priorityCountries.includes(country.iso_3166_1);
          return (
            <div
              key={country.iso_3166_1}
              onClick={() => {
                onCountrySelect(country.iso_3166_1);
                setDrawerVisible(false);
              }}
              style={{
                color: isPriority ? '#ffd700' : '#e0e0e0',
                padding: '10px 16px',
                cursor: 'pointer',
                borderRadius: '6px',
                background: isPriority ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: isPriority ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                fontSize: '13px',
                textAlign: isMobile ? 'left' : 'center',
                fontWeight: isPriority ? '600' : '500',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)';
                e.currentTarget.style.borderColor = '#ff6b6b';
                e.currentTarget.style.color = '#ff6b6b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isPriority ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = isPriority ? 'rgba(255, 215, 0, 0.3)' : 'transparent';
                e.currentTarget.style.color = isPriority ? '#ffd700' : '#e0e0e0';
              }}
            >
              {country.english_name}
              {isPriority && index < 5 && (
                <span style={{
                  fontSize: '10px',
                  marginLeft: '4px',
                  opacity: 0.7
                }}>
                  ⭐
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const profileMenu = (
    <Menu style={{ background: '#1a1a2e', border: '1px solid #16213e' }}>
      <Menu.Item key="profile" icon={<UserOutlined />} style={{ color: '#e0e0e0' }}>
        My Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} style={{ color: '#e0e0e0' }}>
        Settings
      </Menu.Item>
      <Menu.Divider style={{ background: '#16213e' }} />
      <Menu.Item key="logout" icon={<LogoutOutlined />} style={{ color: '#ff6b6b' }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const isActive = (path) => currentPath === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeOutlined /> },
    { path: '/movies', label: 'Movies' },
    { path: '/tv-shows', label: 'TV Shows' },
    { path: '/anime', label: 'Anime' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const mobileMenuItems = (
    <Menu mode="vertical" style={{ border: 'none', background: '#0f0f1e' }}>
      {navLinks.map(link => (
        <Menu.Item 
          key={link.path}
          icon={link.icon}
          onClick={() => {
            handleNavigation(link.path);
            setDrawerVisible(false);
          }}
          style={{ 
            fontWeight: isActive(link.path) ? 'bold' : 'normal',
            color: '#ffffff',
            background: isActive(link.path) ? '#16213e' : 'transparent'
          }}
        >
          <span style={{ color: '#ffffff' }}>{link.label}</span>
        </Menu.Item>
      ))}
      <Menu.Item 
        key="genre" 
        icon={<DownOutlined style={{ color: '#ffffff' }} />}
        onClick={() => {
          setGenreModalVisible(true);
          setDrawerVisible(false);
        }}
        style={{ color: '#ffffff' }}
      >
        <span style={{ color: '#ffffff' }}>Genre</span>
      </Menu.Item>
      <Menu.Item 
        key="country" 
        icon={<DownOutlined style={{ color: '#ffffff' }} />}
        onClick={() => {
          setCountryModalVisible(true);
          setDrawerVisible(false);
        }}
        style={{ color: '#ffffff' }}
      >
        <span style={{ color: '#ffffff' }}>Country</span>
      </Menu.Item>
      <Menu.Divider style={{ background: '#16213e' }} />
      <Menu.Item 
        key="profile" 
        icon={<UserOutlined style={{ color: '#ffffff' }} />}
        style={{ color: '#ffffff' }}
      >
        <span style={{ color: '#ffffff' }}>My Profile</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <style>
        {`
          .mobile-submenu-popup .ant-menu-sub {
            background: #1a1a2e !important;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            max-height: 400px;
            overflow-y: auto;
          }
          
          .mobile-submenu-popup .ant-menu-item {
            color: #ffffff !important;
          }
          
          .mobile-submenu-popup .ant-menu-item:hover {
            background: rgba(255, 107, 107, 0.15) !important;
            color: #ff6b6b !important;
          }
          
          .mobile-submenu-popup .ant-menu-item-selected {
            background: rgba(255, 107, 107, 0.2) !important;
          }

          .ant-dropdown {
            position: fixed !important;
          }

          .genre-dropdown-menu .ant-dropdown-menu {
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
        `}
      </style>
      <Header 
        style={{ 
          background: 'linear-gradient(135deg, #0f0f1e 0%, #16213e 100%)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderBottom: '2px solid #ff6b6b'
        }}
      >
        {!isMobile && (
          <Row justify="space-between" align="middle" style={{ height: '64px' }}>
            <Col flex="none">
              <Space 
                align="center" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleNavigation('/')}
                size="middle"
              >
                <PlayCircleOutlined style={{ fontSize: 32, color: '#ff6b6b' }} />
                <span style={{ 
                  fontSize: 28, 
                  fontWeight: 'bold',
                  color: '#fff',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'Arial Black, sans-serif'
                }}>
                  VIKI
                </span>
              </Space>
            </Col>

            <Col flex="none">
              <Space size="large" style={{ marginLeft: 40 }}>
                {navLinks.map(link => (
                  <a
                    key={link.path}
                    style={{ 
                      color: isActive(link.path) ? '#ff6b6b' : '#e0e0e0',
                      cursor: 'pointer',
                      fontWeight: isActive(link.path) ? '600' : '500',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      padding: '8px 0',
                      borderBottom: isActive(link.path) ? '2px solid #ff6b6b' : '2px solid transparent'
                    }} 
                    onClick={() => handleNavigation(link.path)}
                    onMouseEnter={(e) => {
                      if (!isActive(link.path)) {
                        e.target.style.color = '#ff6b6b';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(link.path)) {
                        e.target.style.color = '#e0e0e0';
                      }
                    }}
                  >
                    {link.icon && <>{link.icon} </>}
                    {link.label}
                  </a>
                ))}
                
                <Dropdown 
                overlay={genreMenu} 
                trigger={['click']}
                placement="bottom"
                align={{ offset: [0, 8] }}
                overlayClassName="genre-dropdown-menu"
                getPopupContainer={(trigger) => trigger.parentElement}
              >
                  <a 
                    style={{ 
                      color: '#e0e0e0', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '15px',
                      transition: 'color 0.3s ease'
                    }} 
                    onClick={e => e.preventDefault()}
                    onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
                    onMouseLeave={(e) => e.target.style.color = '#e0e0e0'}
                  >
                    Genre <DownOutlined />
                  </a>
                </Dropdown>
                
                <Dropdown overlay={countryMenu} trigger={['click']}>
                  <a 
                    style={{ 
                      color: '#e0e0e0', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '15px',
                      transition: 'color 0.3s ease'
                    }} 
                    onClick={e => e.preventDefault()}
                    onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
                    onMouseLeave={(e) => e.target.style.color = '#e0e0e0'}
                  >
                    Country <DownOutlined />
                  </a>
                </Dropdown>
              </Space>
            </Col>

            <Col flex="auto" style={{ display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
              <AutoComplete
                value={searchInputValue}
                options={autocompleteOptions}
                onSelect={handleSearchSelect}
                onSearch={handleSearchInputChange}
                size="large"
                allowClear
                placeholder={getSearchPlaceholder()}
                notFoundContent={
                  searchLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <Spin size="small" />
                    </div>
                  ) : searchInputValue ? (
                    <Empty description="No results found" style={{ padding: '20px' }} />
                  ) : null
                }
                style={{
                  borderRadius: '25px',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '450px'
                }}
                filterOption={false}
                popupMatchSelectWidth={false}
                suffixIcon={<SearchOutlined />}
                onPressEnter={(e) => handleSearch(e.target.value)}
              />
            </Col>

            <Col flex="none">
              <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
                <Avatar 
                  size={40}
                  icon={<UserOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    cursor: 'pointer',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                  }}
                />
              </Dropdown>
            </Col>
          </Row>
        )}

        {isMobile && (
          <>
            <Row justify="space-between" align="middle" style={{ height: '64px' }}>
              {!searchVisible ? (
                <>
                  <Col>
                    <Space 
                      align="center" 
                      onClick={() => handleNavigation('/')} 
                      style={{ cursor: 'pointer' }}
                    >
                      <PlayCircleOutlined style={{ fontSize: 28, color: '#ff6b6b' }} />
                      <span style={{ 
                        fontSize: 22, 
                        fontWeight: 'bold',
                        color: '#fff',
                        letterSpacing: '1.5px',
                        fontFamily: 'Arial Black, sans-serif'
                      }}>
                        VIKI
                      </span>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Button
                        type="text"
                        icon={<SearchOutlined style={{ fontSize: 20, color: '#e0e0e0' }} />}
                        onClick={() => setSearchVisible(true)}
                      />
                      <Button
                        type="text"
                        icon={<MenuOutlined style={{ fontSize: 20, color: '#e0e0e0' }} />}
                        onClick={() => setDrawerVisible(true)}
                      />
                    </Space>
                  </Col>
                </>
              ) : (
                <Col span={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AutoComplete
                      value={searchInputValue}
                      options={autocompleteOptions}
                      onSelect={handleSearchSelect}
                      onSearch={handleSearchInputChange}
                      size="large"
                      allowClear
                      placeholder={getSearchPlaceholder()}
                      notFoundContent={
                        searchLoading ? (
                          <div style={{ padding: '20px', textAlign: 'center' }}>
                            <Spin size="small" />
                          </div>
                        ) : searchInputValue ? (
                          <Empty description="No results found" style={{ padding: '20px' }} />
                        ) : null
                      }
                      style={{
                        borderRadius: '25px',
                        overflow: 'hidden',
                        flex: 1
                      }}
                      filterOption={false}
                      popupMatchSelectWidth={false}
                      autoFocus
                      onPressEnter={(e) => handleSearch(e.target.value)}
                    />
                    <Button
                      type="text"
                      icon={<CloseOutlined style={{ fontSize: 20, color: '#e0e0e0' }} />}
                      onClick={() => setSearchVisible(false)}
                    />
                  </div>
                </Col>
              )}
            </Row>

            <Drawer
              title="Menu"
              placement="right"
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              bodyStyle={{ background: '#0f0f1e', padding: 0 }}
              headerStyle={{ background: '#16213e', color: '#fff', borderBottom: '1px solid #ff6b6b' }}
              width="90%"
            >
              {mobileMenuItems}
            </Drawer>

            {/* Genre Modal for Mobile */}
            <Modal
              title="Select Genre"
              open={genreModalVisible}
              onCancel={() => setGenreModalVisible(false)}
              footer={null}
              centered
              bodyStyle={{ 
                background: '#0f0f1e', 
                maxHeight: '60vh', 
                overflowY: 'auto',
                padding: '20px'
              }}
              style={{ top: 20 }}
              width="90%"
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {genres?.map(genre => (
                  <div
                    key={genre.id}
                    onClick={() => {
                      onGenreSelect(parseInt(genre.id));
                      setGenreModalVisible(false);
                    }}
                    style={{
                      color: '#ffffff',
                      padding: '14px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      fontSize: '14px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}
                  >
                    {genre.name}
                  </div>
                ))}
              </div>
            </Modal>

            {/* Country Modal for Mobile */}
            <Modal
              title="Select Country"
              open={countryModalVisible}
              onCancel={() => setCountryModalVisible(false)}
              footer={null}
              centered
              bodyStyle={{ 
                background: '#0f0f1e', 
                maxHeight: '60vh', 
                overflowY: 'auto',
                padding: '20px'
              }}
              style={{ top: 20 }}
              width="90%"
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {sortedCountries.map((country, index) => {
                  const isPriority = priorityCountries.includes(country.iso_3166_1);
                  return (
                    <div
                      key={country.iso_3166_1}
                      onClick={() => {
                        onCountrySelect(country.iso_3166_1);
                        setCountryModalVisible(false);
                      }}
                      style={{
                        color: isPriority ? '#ffd700' : '#ffffff',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        background: isPriority ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        border: isPriority ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        textAlign: 'left',
                        fontWeight: isPriority ? '600' : '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{country.english_name}</span>
                      {isPriority && index < 5 && (
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>⭐</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Modal>
          </>
        )}
      </Header>
    </>
  );
};

export default Navbar;