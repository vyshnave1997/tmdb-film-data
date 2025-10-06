// Navbar.jsx
import React, { useState } from 'react';
import { Layout, Row, Col, Space, Input, Dropdown, Menu, Drawer, Button } from 'antd';
import { 
  VideoCameraOutlined, 
  HomeOutlined, 
  DownOutlined, 
  MenuOutlined,
  SearchOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Header } = Layout;

export const Navbar = ({ 
  contentType, 
  setContentType, 
  searchTerm, 
  setSearchTerm, 
  genres, 
  countries,
  onHomeClick,
  onGenreSelect,
  onCountrySelect,
  onAnimeClick
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const genreMenu = (
    <Menu
      style={{ maxHeight: '400px', overflowY: 'auto' }}
      onClick={({ key }) => {
        onGenreSelect(parseInt(key));
        setDrawerVisible(false);
      }}
    >
      {genres.map(genre => (
        <Menu.Item key={genre.id}>
          {genre.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const countryMenu = (
    <Menu
      style={{ maxHeight: '400px', overflowY: 'auto' }}
      onClick={({ key }) => {
        onCountrySelect(key);
        setDrawerVisible(false);
      }}
    >
      {countries.map(country => (
        <Menu.Item key={country.iso_3166_1}>
          {country.english_name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleMenuClick = (action) => {
    action();
    setDrawerVisible(false);
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  // Mobile Menu Items
  const mobileMenuItems = (
    <Menu mode="vertical" style={{ border: 'none' }}>
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => handleMenuClick(onHomeClick)}>
        Home
      </Menu.Item>
      <Menu.Item key="anime" onClick={() => handleMenuClick(onAnimeClick)}>
        Anime
      </Menu.Item>
      <Menu.SubMenu key="genre" title="Genre" icon={<DownOutlined />}>
        {genres.map(genre => (
          <Menu.Item key={genre.id} onClick={() => handleMenuClick(() => onGenreSelect(genre.id))}>
            {genre.name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
      <Menu.SubMenu key="country" title="Country" icon={<DownOutlined />}>
        {countries.map(country => (
          <Menu.Item key={country.iso_3166_1} onClick={() => handleMenuClick(() => onCountrySelect(country.iso_3166_1))}>
            {country.english_name}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
      <Menu.Item 
        key="movies" 
        onClick={() => handleMenuClick(() => setContentType('movie'))}
        style={{ fontWeight: contentType === 'movie' ? 'bold' : 'normal' }}
      >
        Movies
      </Menu.Item>
      <Menu.Item 
        key="tv" 
        onClick={() => handleMenuClick(() => setContentType('tv'))}
        style={{ fontWeight: contentType === 'tv' ? 'bold' : 'normal' }}
      >
        TV Shows
      </Menu.Item>
      <Menu.Item key="imdb">
        Top IMDB
      </Menu.Item>
      <Menu.Item key="app">
        Android App
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ backgroundColor: '#3f5f7f', padding: '0 16px', position: 'relative' }}>
      {/* Desktop View */}
      {!isMobile && (
        <Row justify="space-between" align="middle" style={{ height: '64px' }}>
          <Col>
            <Space align="center">
              <VideoCameraOutlined style={{ fontSize: 28, color: 'orange' }} />
            </Space>
          </Col>

          <Col flex="auto">
            <Space size="large" style={{ marginLeft: 40 }}>
              <a style={{ color: 'white', cursor: 'pointer' }} onClick={onHomeClick}>
                <HomeOutlined /> Home
              </a>
              <a style={{ color: 'white', cursor: 'pointer' }} onClick={onAnimeClick}>
                Anime
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

          <Col xs={24} md={8}>
            <Search
              placeholder="Enter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              enterButton
              size="large"
              style={{
                borderRadius: '30px',
                overflow: 'hidden',
                background: 'white',
              }}
            />
          </Col>
        </Row>
      )}

      {/* Mobile View */}
      {isMobile && (
        <>
          <Row justify="space-between" align="middle" style={{ height: '64px' }}>
            {!searchVisible ? (
              <>
                <Col>
                  <Space align="center">
                    <VideoCameraOutlined style={{ fontSize: 24, color: 'orange' }} />
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="text"
                      icon={<SearchOutlined style={{ fontSize: 20, color: 'white' }} />}
                      onClick={toggleSearch}
                    />
                    <Button
                      type="text"
                      icon={<MenuOutlined style={{ fontSize: 20, color: 'white' }} />}
                      onClick={() => setDrawerVisible(true)}
                    />
                  </Space>
                </Col>
              </>
            ) : (
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search
                    placeholder="Enter keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    enterButton
                    size="large"
                    style={{
                      borderRadius: '30px',
                      overflow: 'hidden',
                      background: 'white',
                      flex: 1
                    }}
                    autoFocus
                  />
                  <Button
                    type="text"
                    icon={<CloseOutlined style={{ fontSize: 20, color: 'white' }} />}
                    onClick={toggleSearch}
                  />
                </div>
              </Col>
            )}
          </Row>

          {/* Mobile Drawer */}
          <Drawer
            title={
              <Space>
                <VideoCameraOutlined style={{ fontSize: 24, color: 'orange' }} />
                <span>Menu</span>
              </Space>
            }
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
          >
            {mobileMenuItems}
          </Drawer>
        </>
      )}
    </Header>
  );
};
 
export default Navbar;