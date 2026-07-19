// pages/api/duolingo.js

// Simple in-memory cache for Vercel
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

export default async function handler(req, res) {
  const { username } = req.query;
  
  console.log('📱 Duolingo API called with username:', username);
  
  if (!username) {
    return res.status(400).json({ 
      error: 'Username is required',
      example: '/api/duolingo?username=greatjoel'
    });
  }

  // Check cache
  const cacheKey = `duolingo_${username}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Returning cached data for:', username);
    return res.status(200).json(cached.data);
  }

  try {
    // Try public proxy with the correct username
    console.log('🔄 Fetching from public proxy...');
    const response = await fetch(`https://duolingo-proxy.vercel.app/users/${username}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel; +https://vercel.com)'
      }
    });
    
    if (response.ok) {
      const proxyData = await response.json();
      const userData = proxyData.users?.[0] || proxyData;
      
      console.log('📊 Raw user data:', JSON.stringify(userData, null, 2));
      
      // Parse the languages properly
      let languages = userData.languages || [];
      let languageProgress = {};
      
      // If the languages are in a different format
      if (userData.languageProgress) {
        languageProgress = userData.languageProgress;
        languages = Object.keys(languageProgress);
      }
      
      // If languages are in the old format
      if (Array.isArray(userData.language_data)) {
        languageProgress = {};
        userData.language_data.forEach(lang => {
          const langCode = lang.language_abbr || lang.language;
          if (langCode) {
            languageProgress[langCode] = {
              level: lang.level || 0,
              points: lang.points || lang.xp || 0,
              streak: lang.streak || 0,
              language_string: lang.language_string || langCode
            };
          }
        });
        languages = Object.keys(languageProgress);
      }
      
      // Get the main learning language
      const learningLanguage = userData.learningLanguage || 
                             (languages.length > 0 ? languages[0] : 'en');
      
      const data = {
        username: userData.username || username,
        xp: userData.totalXp || 0,
        level: userData.level || 1,
        streak: userData.streak || 0,
        languages: languages,
        learningLanguage: learningLanguage,
        languageProgress: languageProgress,
        allLanguages: userData.language_data || userData.languages || [],
        _source: 'public-proxy'
      };
      
      // Cache the data
      cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      console.log('✅ Data from public proxy! Languages:', languages);
      return res.status(200).json(data);
    }
    
    throw new Error('Proxy returned non-200');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    // Try alternative proxy
    try {
      console.log('🔄 Trying alternative proxy...');
      const altResponse = await fetch(`https://duolingo-api.cyclic.app/users/${username}`);
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        const userData = altData.users?.[0] || altData;
        
        const data = {
          username: userData.username || username,
          xp: userData.totalXp || 0,
          level: userData.level || 1,
          streak: userData.streak || 0,
          languages: userData.languages || ['en', 'de'],
          languageProgress: userData.languageProgress || {},
          learningLanguage: userData.learningLanguage || 'en',
          _source: 'alternative-proxy'
        };
        
        cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        console.log('✅ Data from alternative proxy!');
        return res.status(200).json(data);
      }
    } catch (altError) {
      console.log('❌ Alternative proxy failed:', altError.message);
    }
    
    // Return cached data if available (even if expired)
    if (cached) {
      console.log('📦 Using expired cache for:', username);
      return res.status(200).json(cached.data);
    }
    
    // Final fallback: Mock data with multiple languages
    console.log('📦 Using fallback mock data for:', username);
    return res.status(200).json({
      username: username,
      xp: 1250,
      level: 5,
      streak: 12,
      languages: ['en', 'de', 'fr'],
      learningLanguage: 'en',
      languageProgress: {
        en: { 
          level: 5, 
          points: 500, 
          streak: 12,
          language_string: 'English'
        },
        de: { 
          level: 4, 
          points: 450, 
          streak: 8,
          language_string: 'German'
        },
        fr: { 
          level: 3, 
          points: 300, 
          streak: 5,
          language_string: 'French'
        }
      },
      _source: 'fallback-mock-data'
    });
  }
}