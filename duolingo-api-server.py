from flask import Flask, jsonify, request
from flask_cors import CORS
import duolingo
import os
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/api/duolingo/<username>')
def get_duolingo_data(username):
    try:
        print(f"🔍 Fetching Duolingo data for: {username}")
        
        # Try to get the user
        lingo = duolingo.Duolingo(username)
        
        # Get user info
        try:
            user_info = lingo.get_user_info()
            print(f"👤 User found: {user_info.get('username', username)}")
        except Exception as e:
            print(f"⚠️ Could not get user info: {e}")
            user_info = {'username': username}
        
        # Get streak info
        try:
            streak_info = lingo.get_streak_info()
            print(f"🔥 Streak: {streak_info.get('site_streak', 0)} days")
        except Exception as e:
            print(f"⚠️ Could not get streak: {e}")
            streak_info = {'site_streak': 0, 'daily_goal': 10}
        
        # Get languages
        try:
            languages = lingo.get_languages()
            print(f"🌍 Languages: {languages}")
        except Exception as e:
            print(f"⚠️ Could not get languages: {e}")
            languages = ['fr']
        
        # Get detailed progress for each language
        language_progress = {}
        for lang in languages:
            try:
                progress = lingo.get_language_progress(lang)
                language_progress[lang] = {
                    'level': progress.get('level', 0),
                    'points': progress.get('points', 0),
                    'streak': progress.get('streak', 0),
                    'level_percent': progress.get('level_percent', 0),
                    'num_skills_learned': progress.get('num_skills_learned', 0)
                }
                print(f"📊 {lang}: Level {progress.get('level', 0)}, {progress.get('points', 0)} XP")
            except Exception as e:
                print(f"⚠️ Error getting progress for {lang}: {e}")
                language_progress[lang] = {
                    'level': 0,
                    'points': 0,
                    'streak': 0,
                    'level_percent': 0,
                    'num_skills_learned': 0
                }
        
        # Get vocabulary count
        vocab_counts = {}
        for lang in languages:
            try:
                vocabulary = lingo.get_vocabulary(lang)
                vocab_counts[lang] = len(vocabulary.get('vocab_overview', []))
                print(f"📝 {lang}: {vocab_counts[lang]} words")
            except:
                vocab_counts[lang] = 0
        
        # Get known topics
        known_topics = {}
        for lang in languages:
            try:
                topics = lingo.get_known_topics(lang)
                known_topics[lang] = topics[:10]
            except:
                known_topics[lang] = []
        
        response_data = {
            'username': username,
            'user_info': user_info,
            'streak': streak_info.get('site_streak', 0),
            'daily_goal': streak_info.get('daily_goal', 10),
            'languages': languages,
            'language_progress': language_progress,
            'vocabulary_count': vocab_counts,
            'known_topics': known_topics,
            'total_xp': sum([p.get('points', 0) for p in language_progress.values()]),
            '_source': 'railway-python-api',
            '_is_real_data': True
        }
        
        print(f"✅ Successfully fetched data for {username}!")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc(),
            '_source': 'railway-python-api-error',
            '_is_real_data': False
        }), 500

@app.route('/')
def home():
    return jsonify({
        'status': 'Duolingo API Server is running',
        'version': '1.0.0',
        'endpoints': {
            '/api/duolingo/<username>': 'Get Duolingo data for a user',
            '/health': 'Health check endpoint'
        },
        'example': 'https://your-railway-app.railway.app/api/duolingo/greatjoel'
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': __import__('datetime').datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Duolingo API Server on port {port}...")
    print(f"📍 Server: http://localhost:{port}")
    app.run(host='0.0.0.0', port=port)