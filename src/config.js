// config.js
export const API_KEY = 'ffc5385a41a65394115a1346134c47f8';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

export const STREAMING_SERVERS = [
  { 
    name: 'VidSrc.to (Primary)', 
    url: 'https://vidsrc.to/embed',
    priority: 1,
    supports: ['movie', 'tv']
  },
  { 
    name: 'VidSrc.me', 
    url: 'https://vidsrc.me/embed',
    priority: 2,
    supports: ['movie', 'tv']
  },
  { 
    name: 'VidSrc.xyz', 
    url: 'https://vidsrc.xyz/embed',
    priority: 3,
    supports: ['movie', 'tv']
  },
  { 
    name: '2Embed', 
    url: 'https://www.2embed.cc/embed',
    priority: 4,
    supports: ['movie', 'tv']
  },
  { 
    name: 'MoviesAPI', 
    url: 'https://moviesapi.club/embed',
    priority: 5,
    supports: ['movie', 'tv']
  },
  { 
    name: 'Smashystream', 
    url: 'https://player.smashystream.com/embed',
    priority: 6,
    supports: ['movie', 'tv']
  },
  { 
    name: 'VidSrc.pro', 
    url: 'https://vidsrc.pro/embed',
    priority: 7,
    supports: ['movie', 'tv']
  },
  { 
    name: 'SuperEmbed', 
    url: 'https://multiembed.mov/directstream.php',
    priority: 8,
    supports: ['movie', 'tv'],
    urlBuilder: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://multiembed.mov/directstream.php?video_id=${id}&s=${season.season_number}&e=${episode.episode_number}`;
      }
      return `https://multiembed.mov/directstream.php?video_id=${id}`;
    }
  },
  { 
    name: 'VidLink', 
    url: 'https://vidlink.pro/embed',
    priority: 9,
    supports: ['movie', 'tv']
  },
  { 
    name: 'Embed.su', 
    url: 'https://embed.su/embed',
    priority: 10,
    supports: ['movie', 'tv'],
    urlBuilder: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://embed.su/embed/tv/${id}/${season.season_number}/${episode.episode_number}`;
      }
      return `https://embed.su/embed/movie/${id}`;
    }
  }
];

// Get the best available server for content type
export const getBestServer = (contentType = 'movie') => {
  const availableServers = STREAMING_SERVERS.filter(server => 
    server.supports.includes(contentType)
  );
  
  // Return server with lowest priority (highest preference)
  return availableServers.sort((a, b) => a.priority - b.priority)[0] || STREAMING_SERVERS[0];
};

// Get servers by content type
export const getServersByType = (contentType = 'movie') => {
  return STREAMING_SERVERS.filter(server => 
    server.supports.includes(contentType)
  ).sort((a, b) => a.priority - b.priority);
};