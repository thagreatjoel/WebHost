// pages/api/duolingo.js - Vercel-only solution

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
  
  // Return cached data if valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Returning cached data for:', username);
    return res.status(200).json({
      ...cached.data,
      _cached: true,
      _cached_at: new Date(cached.timestamp).toISOString()
    });
  }

  try {
    // Try public proxy first (most reliable)
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
      
      const data = {
        username: userData.username || username,
        xp: userData.totalXp || 0,
        level: userData.level || 1,
        streak: userData.streak || 0,
        languages: userData.languages || ['fr'],
        languageProgress: userData.languageProgress || {},
        learningLanguage: userData.learningLanguage || 'fr',
        dailyGoal: userData.dailyGoal || 10,
        _source: 'public-proxy'
      };
      
      // Cache the data
      cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      console.log('✅ Data from public proxy!');
      return res.status(200).json(data);
    }
    
    // If proxy fails, try alternative API
    console.log('⚠️ Proxy failed, trying alternative...');
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
          languages: userData.languages || ['fr'],
          languageProgress: userData.languageProgress || {},
          learningLanguage: userData.learningLanguage || 'fr',
          dailyGoal: userData.dailyGoal || 10,
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
      return res.status(200).json({
        ...cached.data,
        _cached: true,
        _expired: true
      });
    }
    
    // Final fallback: Mock data with realistic values
    console.log('📦 Using fallback mock data for:', username);
    return res.status(200).json({
      username: username,
      xp: 1250,
      level: 5,
      streak: 12,
      languages: ['fr'],
      languageProgress: {
        fr: { 
          level: 5, 
          points: 1250, 
          streak: 12,
          level_percent: 60,
          num_skills_learned: 45
        }
      },
      learningLanguage: 'fr',
      dailyGoal: 10,
      _source: 'fallback-mock-data',
      _note: 'Using mock data - all proxy attempts failed'
    });
  }
}