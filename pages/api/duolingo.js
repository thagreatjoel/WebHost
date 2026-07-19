// pages/api/duolingo.js

import fs from 'fs';
import path from 'path';

const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

export default async function handler(req, res) {
  const { username } = req.query;
  
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
    console.log('📦 Returning cached data');
    return res.status(200).json(cached.data);
  }

  try {
    // Read real data from JSON file
    const dataPath = path.join(process.cwd(), 'duolingo_real_data.json');
    
    if (fs.existsSync(dataPath)) {
      const fileData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      if (fileData.username === username) {
        console.log('✅ Using REAL data from file!');
        
        // Parse courses from full_data
        const courses = fileData.full_data?.courses || [];
        const languageProgress = {};
        const languages = [];
        
        courses.forEach(course => {
          const langCode = course.learningLanguage;
          if (langCode) {
            languages.push(langCode);
            languageProgress[langCode] = {
              level: Math.floor(course.xp / 100) + 1 || 1, // Approximate level from XP
              points: course.xp || 0,
              streak: fileData.streak || 0,
              language_string: course.title || langCode.toUpperCase(),
              crowns: course.crowns || 0
            };
          }
        });
        
        // If no courses found, use the learning language
        if (languages.length === 0 && fileData.learning_language) {
          languages.push(fileData.learning_language);
          languageProgress[fileData.learning_language] = {
            level: fileData.level || 1,
            points: fileData.total_xp || 0,
            streak: fileData.streak || 0,
            language_string: fileData.learning_language.toUpperCase()
          };
        }
        
        const data = {
          username: fileData.username,
          xp: fileData.total_xp,
          level: fileData.level,
          streak: fileData.streak,
          languages: languages,
          learningLanguage: fileData.learning_language || 'en',
          languageProgress: languageProgress,
          _source: 'real-data',
          _timestamp: fileData._timestamp
        };
        
        cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        return res.status(200).json(data);
      }
    }

    // If no file, try live API
    console.log('🔄 Fetching live data...');
    const response = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`);
    
    if (response.ok) {
      const apiData = await response.json();
      const userData = apiData.users?.[0];
      
      if (userData) {
        const courses = userData.courses || [];
        const languageProgress = {};
        const languages = [];
        
        courses.forEach(course => {
          const langCode = course.learningLanguage;
          if (langCode) {
            languages.push(langCode);
            languageProgress[langCode] = {
              level: Math.floor(course.xp / 100) + 1 || 1,
              points: course.xp || 0,
              streak: userData.streak || 0,
              language_string: course.title || langCode.toUpperCase()
            };
          }
        });
        
        const data = {
          username: userData.username || username,
          xp: userData.totalXp || 0,
          level: userData.level || 1,
          streak: userData.streak || 0,
          languages: languages,
          learningLanguage: userData.learningLanguage || 'en',
          languageProgress: languageProgress,
          _source: 'live-api'
        };
        
        cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        return res.status(200).json(data);
      }
    }
    
    // Fallback
    return res.status(200).json({
      username: username,
      xp: 1819,
      level: 1,
      streak: 13,
      languages: ['en', 'de'],
      learningLanguage: 'en',
      languageProgress: {
        en: { level: 1, points: 1013, streak: 13, language_string: 'English' },
        de: { level: 1, points: 806, streak: 13, language_string: 'German' }
      },
      _source: 'fallback'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}