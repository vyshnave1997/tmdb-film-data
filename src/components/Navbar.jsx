import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Space, Input, Dropdown, Menu, Drawer, Button, Avatar } from 'antd';
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

const { Search } = Input;
const { Header } = Layout;

export const Navbar = ({ 
  searchTerm, 
  setSearchTerm, 
  genres, 
  countries,
  onGenreSelect,
  onCountrySelect,
  onSearch
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-search while typing with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      }
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const currentPath = window.location.pathname || '/';

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

  const handleSearch = (value) => {
    if (!value.trim()) return;

    const pathToType = {
      '/': 'all',
      '/movies': 'movie',
      '/tv-shows': 'tv',
      '/anime': 'anime'
    };

    if (onSearch) {
      onSearch(value, pathToType[currentPath] || 'all');
    }
  };

  const genreMenu = (
    <Menu
      style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        background: '#1a1a2e',
        border: '1px solid #16213e',
        width: '200px',
        maxWidth: 'fit-content'
      }}
      onClick={({ key }) => {
        onGenreSelect(parseInt(key));
        setDrawerVisible(false);
      }}
    >
      {genres?.map(genre => (
        <Menu.Item 
          key={genre.id}
          style={{ color: '#e0e0e0' }}
        >
          {genre.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const countryMenu = (
    <Menu
      style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        background: '#1a1a2e',
        border: '1px solid #16213e',
        width: '250px',
        maxWidth: 'fit-content'
      }}
      onClick={({ key }) => {
        onCountrySelect(key);
        setDrawerVisible(false);
      }}
    >
      {countries?.map(country => (
        <Menu.Item 
          key={country.iso_3166_1}
          style={{ color: '#e0e0e0' }}
        >
          {country.english_name}
        </Menu.Item>
      ))}
    </Menu>
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
    window.location.pathname = path;
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
            color: '#e0e0e0',
            background: isActive(link.path) ? '#16213e' : 'transparent'
          }}
        >
          {link.label}
        </Menu.Item>
      ))}
      <Menu.SubMenu 
        key="genre" 
        title="Genre" 
        icon={<DownOutlined />}
        style={{ color: '#e0e0e0' }}
      >
        {genres?.map(genre => (
          <Menu.Item 
            key={genre.id} 
            onClick={() => {
              onGenreSelect(genre.id);
              setDrawerVisible(false);
            }}
            style={{ color: '#e0e0e0' }}
          >
            {genre.name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
      <Menu.SubMenu 
        key="country" 
        title="Country" 
        icon={<DownOutlined />}
        style={{ color: '#e0e0e0' }}
      >
        {countries?.map(country => (
          <Menu.Item 
            key={country.iso_3166_1} 
            onClick={() => {
              onCountrySelect(country.iso_3166_1);
              setDrawerVisible(false);
            }}
            style={{ color: '#e0e0e0' }}
          >
            {country.english_name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
      <Menu.Divider style={{ background: '#16213e' }} />
      <Menu.Item 
        key="profile" 
        icon={<UserOutlined />}
        style={{ color: '#e0e0e0' }}
      >
        My Profile
      </Menu.Item>
    </Menu>
  );

  return (
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
              
              <Dropdown overlay={genreMenu} trigger={['click']}>
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
            <Search
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              allowClear
              enterButton
              size="large"
              style={{
                borderRadius: '25px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '450px'
              }}
              className="custom-search"
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
                  <Search
                    placeholder={getSearchPlaceholder()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    allowClear
                    enterButton
                    size="large"
                    style={{
                      borderRadius: '25px',
                      overflow: 'hidden',
                      flex: 1
                    }}
                    autoFocus
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
            title={
              <Space>
                <PlayCircleOutlined style={{ fontSize: 24, color: '#ff6b6b' }} />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>VIKI</span>
              </Space>
            }
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
            headerStyle={{ 
              background: 'linear-gradient(135deg, #0f0f1e 0%, #16213e 100%)',
              borderBottom: '2px solid #ff6b6b'
            }}
            bodyStyle={{ 
              background: '#0f0f1e',
              padding: 0
            }}
          >
            {mobileMenuItems}
          </Drawer>
        </>
      )}

      <style jsx="true">{`
        .custom-search .ant-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .custom-search .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .custom-search .ant-input-search-button {
          background: #ff6b6b;
          border: none;
        }
        .custom-search .ant-input-search-button:hover {
          background: #ee5a6f;
        }
        .custom-search .ant-input-clear-icon {
          color: rgba(255, 255, 255, 0.65);
        }
        .custom-search .ant-input-clear-icon:hover {
          color: #fff;
        }
        .ant-dropdown-menu {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ant-dropdown-menu::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Header>
  );
};

export default Navbar;