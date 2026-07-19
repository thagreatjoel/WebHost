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
        
        // Get courses from full_data
        const courses = fileData.full_data?.courses || [];
        const languageProgress = {};
        const languages = [];
        let totalXp = 0;
        
        // Parse each course
        courses.forEach(course => {
          const langCode = course.learningLanguage;
          if (langCode) {
            languages.push(langCode);
            const xp = course.xp || 0;
            totalXp += xp;
            
            languageProgress[langCode] = {
              level: Math.floor(xp / 100) + 1 || 1,
              points: xp,
              streak: fileData.streak || 0,
              language_string: course.title || langCode.toUpperCase(),
              crowns: course.crowns || 0,
              fromLanguage: course.fromLanguage || 'en',
              courseId: course.id || ''
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
            language_string: fileData.learning_language.toUpperCase(),
            crowns: 0
          };
          totalXp = fileData.total_xp || 0;
        }
        
        // Return the FULL data
        const data = {
          username: fileData.username,
          total_xp: fileData.total_xp || totalXp, // Use the actual total from API
          level: fileData.level || 1,
          streak: fileData.streak || 0,
          learning_language: fileData.learning_language || 'en',
          languages: languages,
          language_progress: languageProgress,
          full_data: fileData.full_data, // Include all raw data
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
    const response = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const apiData = await response.json();
      const userData = apiData.users?.[0];
      
      if (userData) {
        const courses = userData.courses || [];
        const languageProgress = {};
        const languages = [];
        let totalXp = 0;
        
        courses.forEach(course => {
          const langCode = course.learningLanguage;
          if (langCode) {
            languages.push(langCode);
            const xp = course.xp || 0;
            totalXp += xp;
            
            languageProgress[langCode] = {
              level: Math.floor(xp / 100) + 1 || 1,
              points: xp,
              streak: userData.streak || 0,
              language_string: course.title || langCode.toUpperCase(),
              crowns: course.crowns || 0,
              fromLanguage: course.fromLanguage || 'en'
            };
          }
        });
        
        const data = {
          username: userData.username || username,
          total_xp: userData.totalXp || totalXp,
          level: userData.level || 1,
          streak: userData.streak || 0,
          learning_language: userData.learningLanguage || 'en',
          languages: languages,
          language_progress: languageProgress,
          full_data: userData,
          _source: 'live-api'
        };
        
        cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        return res.status(200).json(data);
      }
    }
    
    // Fallback with REAL data
    return res.status(200).json({
      username: username,
      total_xp: 1819,
      level: 1,
      streak: 13,
      learning_language: 'en',
      languages: ['en', 'de'],
      language_progress: {
        en: { 
          level: 11, 
          points: 1013, 
          streak: 13, 
          language_string: 'English',
          crowns: 9999
        },
        de: { 
          level: 9, 
          points: 806, 
          streak: 13, 
          language_string: 'German',
          crowns: 9999
        }
      },
      full_data: null,
      _source: 'fallback'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}