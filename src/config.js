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
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidSrc.me', 
    url: 'https://vidsrc.me/embed',
    priority: 2,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidSrc.xyz', 
    url: 'https://vidsrc.xyz/embed',
    priority: 3,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: '2Embed', 
    url: 'https://www.2embed.cc/embed',
    priority: 4,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'MoviesAPI', 
    url: 'https://moviesapi.club/embed',
    priority: 5,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidSrc.pro', 
    url: 'https://vidsrc.pro/embed',
    priority: 6,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'Smashystream', 
    url: 'https://player.smashystream.com/embed',
    priority: 7,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidLink', 
    url: 'https://vidlink.pro/embed',
    priority: 8,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'SuperEmbed', 
    url: 'https://multiembed.mov/directstream.php',
    priority: 9,
    supports: ['movie', 'tv'],
    region: 'global',
    urlBuilder: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://multiembed.mov/directstream.php?video_id=${id}&s=${season.season_number}&e=${episode.episode_number}`;
      }
      return `https://multiembed.mov/directstream.php?video_id=${id}`;
    }
  },
  { 
    name: 'Embed.su', 
    url: 'https://embed.su/embed',
    priority: 10,
    supports: ['movie', 'tv'],
    region: 'global',
    urlBuilder: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://embed.su/embed/tv/${id}/${season.season_number}/${episode.episode_number}`;
      }
      return `https://embed.su/embed/movie/${id}`;
    }
  },
  // Asian Content Servers
  { 
    name: 'VidCloud (Asian)', 
    url: 'https://vidcloud.icu/embed',
    priority: 11,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'AsianLoad', 
    url: 'https://asianload.io/embed',
    priority: 12,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'DramaDay', 
    url: 'https://dramaday.me/embed',
    priority: 13,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'KissAsian', 
    url: 'https://kissasian.video/embed',
    priority: 14,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'MyAsianTV', 
    url: 'https://myasiantv.ac/embed',
    priority: 15,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'StreamSB (Asian)', 
    url: 'https://streamsb.net/embed',
    priority: 16,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'FastDrama', 
    url: 'https://fastdrama.me/embed',
    priority: 17,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  // Anime Specific Servers
  { 
    name: 'GogoAnime', 
    url: 'https://gogoanime.lu/embed',
    priority: 18,
    supports: ['tv'],
    region: 'anime'
  },
  { 
    name: 'AnimeSuge', 
    url: 'https://animesuge.to/embed',
    priority: 19,
    supports: ['tv'],
    region: 'anime'
  },
  { 
    name: 'Zoro.to', 
    url: 'https://zoro.to/embed',
    priority: 20,
    supports: ['tv'],
    region: 'anime'
  },
  { 
    name: '9Anime', 
    url: 'https://9anime.to/embed',
    priority: 21,
    supports: ['tv'],
    region: 'anime'
  },
  // Indian Content Servers
  { 
    name: 'DesiCinemas', 
    url: 'https://desicinemas.tv/embed',
    priority: 22,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'BollyFlix', 
    url: 'https://bollyflix.video/embed',
    priority: 23,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'HindiLinks4u', 
    url: 'https://hindilinks4u.to/embed',
    priority: 24,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'MkvCinemas', 
    url: 'https://mkvcinemas.com/embed',
    priority: 25,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'Hotstar Mirror', 
    url: 'https://hotstar-mirror.vercel.app/embed',
    priority: 26,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'Zee5 Stream', 
    url: 'https://zee5stream.com/embed',
    priority: 27,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'SonyLiv Mirror', 
    url: 'https://sonyliv.uno/embed',
    priority: 28,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  // Additional Multi-Region Servers
  { 
    name: 'VidPlay', 
    url: 'https://vidplay.site/embed',
    priority: 29,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'FileMoon', 
    url: 'https://filemoon.sx/embed',
    priority: 30,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'Streamtape', 
    url: 'https://streamtape.com/embed',
    priority: 31,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'Doodstream', 
    url: 'https://dood.to/embed',
    priority: 32,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  // Philippine Content Servers
  { 
    name: 'PinoyFlix', 
    url: 'https://pinoyflix.su/embed',
    priority: 33,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyMovies', 
    url: 'https://pinoymovies.es/embed',
    priority: 34,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'Tambayan', 
    url: 'https://tambayan.live/embed',
    priority: 35,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyMoviePedia', 
    url: 'https://pinoymoviepedia.ru/embed',
    priority: 36,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyHD', 
    url: 'https://pinoyhd.xyz/embed',
    priority: 37,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'LambinganHD', 
    url: 'https://lambinganhd.com/embed',
    priority: 38,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyChannel', 
    url: 'https://pinoychannel.ph/embed',
    priority: 39,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'TFC Stream', 
    url: 'https://tfcstream.net/embed',
    priority: 40,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'IWantTFC Mirror', 
    url: 'https://iwanttfc-mirror.com/embed',
    priority: 41,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'GMA Stream', 
    url: 'https://gmastream.com/embed',
    priority: 42,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'GMA Stream', 
    url: 'https://gmastream.com/embed',
    priority: 42,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  // Additional Global Servers
  { 
    name: 'VidMoly', 
    url: 'https://vidmoly.to/embed',
    priority: 43,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'UpCloud', 
    url: 'https://upcloud.to/embed',
    priority: 44,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'MixDrop', 
    url: 'https://mixdrop.co/embed',
    priority: 45,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'UpStream', 
    url: 'https://upstream.to/embed',
    priority: 46,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidGuard', 
    url: 'https://vidguard.to/embed',
    priority: 47,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'StreamWish', 
    url: 'https://streamwish.to/embed',
    priority: 48,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidHide', 
    url: 'https://vidhide.com/embed',
    priority: 49,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'Lulustream', 
    url: 'https://lulustream.com/embed',
    priority: 50,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  // More Asian Servers
  { 
    name: 'DramaCool', 
    url: 'https://dramacool.so/embed',
    priority: 51,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'ViewAsian', 
    url: 'https://viewasian.co/embed',
    priority: 52,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'KissKh', 
    url: 'https://kisskh.co/embed',
    priority: 53,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'AsianEmbed', 
    url: 'https://asianembed.io/embed',
    priority: 54,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  // More Anime Servers
  { 
    name: 'AnimeWatch', 
    url: 'https://animewatch.to/embed',
    priority: 55,
    supports: ['tv'],
    region: 'anime'
  },
  { 
    name: 'HiAnime', 
    url: 'https://hianime.to/embed',
    priority: 56,
    supports: ['tv'],
    region: 'anime'
  },
  { 
    name: 'AniPlay', 
    url: 'https://aniplay.to/embed',
    priority: 57,
    supports: ['tv'],
    region: 'anime'
  },
  // More Indian Servers
  { 
    name: 'VegaMovies', 
    url: 'https://vegamovies.st/embed',
    priority: 58,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'FilmyZilla', 
    url: 'https://filmyzilla.digital/embed',
    priority: 59,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'MoviesVerse', 
    url: 'https://moviesverse.mov/embed',
    priority: 60,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'HDHub4u', 
    url: 'https://hdhub4u.mov/embed',
    priority: 61,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  // Add these to your STREAMING_SERVERS array in config.js
// Replace the existing anime servers section with this expanded version:

// Anime Specific Servers
{ 
  name: 'GogoAnime', 
  url: 'https://gogoanime.lu/embed',
  priority: 18,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimeSuge', 
  url: 'https://animesuge.to/embed',
  priority: 19,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'Zoro.to', 
  url: 'https://zoro.to/embed',
  priority: 20,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: '9Anime', 
  url: 'https://9anime.to/embed',
  priority: 21,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimeWatch', 
  url: 'https://animewatch.to/embed',
  priority: 55,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'HiAnime', 
  url: 'https://hianime.to/embed',
  priority: 56,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AniPlay', 
  url: 'https://aniplay.to/embed',
  priority: 57,
  supports: ['tv'],
  region: 'anime'
},
// Additional Anime Servers
{ 
  name: 'Anilist', 
  url: 'https://anilist.to/embed',
  priority: 62,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimixPlay', 
  url: 'https://animixplay.to/embed',
  priority: 63,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AllAnime', 
  url: 'https://allanime.to/embed',
  priority: 64,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'Crunchyroll Mirror', 
  url: 'https://crunchyroll-mirror.to/embed',
  priority: 65,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimeDao', 
  url: 'https://animedao.to/embed',
  priority: 66,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'SubsPlease Mirror', 
  url: 'https://subsplease-mirror.to/embed',
  priority: 67,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'Nyaa Stream', 
  url: 'https://nyaastream.to/embed',
  priority: 68,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimeKisa', 
  url: 'https://animekisa.tv/embed',
  priority: 69,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'KickAssAnime', 
  url: 'https://kickassanime.io/embed',
  priority: 70,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimeFreak', 
  url: 'https://animefreak.tv/embed',
  priority: 71,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'Aniflix', 
  url: 'https://aniflix.to/embed',
  priority: 72,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'OtakuStream', 
  url: 'https://otakustream.tv/embed',
  priority: 73,
  supports: ['tv'],
  region: 'anime'
},
{ 
  name: 'AnimeXin', 
  url: 'https://animexin.io/embed',
  priority: 74,
  supports: ['tv'],
  region: 'anime'
},


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

// Get servers by region
export const getServersByRegion = (region) => {
  return STREAMING_SERVERS.filter(server => 
    server.region === region || server.region === 'global'
  ).sort((a, b) => a.priority - b.priority);
};

// Get best server based on content type and region hint
export const getSmartServer = (contentType = 'movie', genres = [], originCountry = '') => {
  // Check if it's anime
  const isAnime = genres.some(g => g.id === 16);
  if (isAnime) {
    const animeServers = STREAMING_SERVERS.filter(s => 
      s.region === 'anime' && s.supports.includes(contentType)
    );
    if (animeServers.length > 0) return animeServers[0];
  }
  
  // Check if it's Philippine content
  const philippineCountries = ['PH'];
  const isPhilippine = originCountry && philippineCountries.includes(originCountry);
  if (isPhilippine) {
    const philippineServers = STREAMING_SERVERS.filter(s => 
      s.region === 'philippine' && s.supports.includes(contentType)
    );
    if (philippineServers.length > 0) return philippineServers[0];
  }
  
  // Check if it's Asian content (Korean, Japanese, Chinese, etc.)
  const asianCountries = ['KR', 'JP', 'CN', 'TW', 'TH', 'HK', 'SG'];
  const isAsian = originCountry && asianCountries.includes(originCountry);
  if (isAsian) {
    const asianServers = STREAMING_SERVERS.filter(s => 
      s.region === 'asian' && s.supports.includes(contentType)
    );
    if (asianServers.length > 0) return asianServers[0];
  }
  
  // Check if it's Indian content
  const indianCountries = ['IN'];
  const isIndian = originCountry && indianCountries.includes(originCountry);
  if (isIndian) {
    const indianServers = STREAMING_SERVERS.filter(s => 
      s.region === 'indian' && s.supports.includes(contentType)
    );
    if (indianServers.length > 0) return indianServers[0];
  }
  
  // Default to best global server
  return getBestServer(contentType);
};

// Check if a server URL is accessible
export const checkServerAvailability = async (server, type, id, season = null, episode = null) => {
  try {
    // Build the URL
    let url;
    if (server.urlBuilder) {
      url = server.urlBuilder(type, id, season, episode);
    } else {
      const serverUrl = server.url;
      if (type === 'tv' && season && episode) {
        url = `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (type === 'movie') {
        url = `${serverUrl}/movie/${id}`;
      }
    }

    // Try to check if the URL is accessible (simple check)
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    return true; // If no error, assume it's available
  } catch (error) {
    return false; // If error, mark as unavailable
  }
};

// Check multiple servers and return working ones
export const getWorkingServers = async (contentType, id, season = null, episode = null) => {
  const servers = getServersByType(contentType);
  const workingServers = [];
  
  // Check first 5 servers for speed (don't check all 42)
  const serversToCheck = servers.slice(0, 5);
  
  const checks = serversToCheck.map(async (server) => {
    const isWorking = await checkServerAvailability(server, contentType, id, season, episode);
    if (isWorking) {
      return server;
    }
    return null;
  });
  
  const results = await Promise.all(checks);
  
  // Filter out null values and return working servers
  return results.filter(server => server !== null);
};

