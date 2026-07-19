# get_duolingo_data.py
import requests
import json
import time

def get_real_duolingo_data(username):
    """Get REAL data from Duolingo's public API"""
    try:
        print(f"🔍 Fetching REAL data for: {username}")
        
        # Use the public API endpoint (this works!)
        url = f"https://www.duolingo.com/2017-06-30/users?username={username}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.duolingo.com',
            'Referer': 'https://www.duolingo.com/',
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            
            if users:
                user_data = users[0]
                print(f"✅ Found user: {user_data.get('username')}")
                print(f"📊 Total XP: {user_data.get('totalXp', 0)}")
                print(f"🔥 Streak: {user_data.get('streak', 0)}")
                print(f"🌍 Learning: {user_data.get('learningLanguage', 'en')}")
                
                # Get language data
                language_data = []
                if 'language_data' in user_data:
                    language_data = user_data['language_data']
                    print(f"📚 Languages: {len(language_data)}")
                    for lang in language_data:
                        print(f"   - {lang.get('language_string', lang.get('language'))}: {lang.get('points', 0)} XP")
                
                # Save the full data
                result = {
                    'username': user_data.get('username'),
                    'total_xp': user_data.get('totalXp', 0),
                    'level': user_data.get('level', 1),
                    'streak': user_data.get('streak', 0),
                    'learning_language': user_data.get('learningLanguage', 'en'),
                    'languages': [lang.get('language') for lang in language_data if lang.get('language')],
                    'language_progress': {},
                    'full_data': user_data,  # Keep the full data
                    '_source': 'real-public-api',
                    '_timestamp': time.time()
                }
                
                # Parse language progress
                for lang in language_data:
                    lang_code = lang.get('language')
                    if lang_code:
                        result['language_progress'][lang_code] = {
                            'level': lang.get('level', 0),
                            'points': lang.get('points', 0),
                            'streak': lang.get('streak', 0),
                            'language_string': lang.get('language_string', lang_code)
                        }
                
                return result
            else:
                print("❌ No users found")
                return None
        else:
            print(f"❌ API returned status: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def get_detailed_profile_data(username):
    """Get even more detailed data from the profile page"""
    try:
        print(f"\n🔍 Fetching profile data for: {username}")
        
        # Try the profile endpoint
        url = f"https://www.duolingo.com/profile/{username}"
        response = requests.get(url)
        
        if response.status_code == 200:
            # Parse the HTML or check if we can find data
            print(f"✅ Profile page accessible")
            print(f"   URL: {url}")
            
            # Try to find the data in the page source
            html = response.text
            
            # Look for the JSON data in the page
            import re
            json_pattern = r'window\.__DUOLINGO_DATA__\s*=\s*({.*?});'
            match = re.search(json_pattern, html)
            
            if match:
                try:
                    json_data = json.loads(match.group(1))
                    print("✅ Found embedded data in page")
                    return json_data
                except:
                    pass
            
            return {'profile_url': url}
            
    except Exception as e:
        print(f"❌ Error fetching profile: {e}")
        return None

if __name__ == '__main__':
    print("=" * 60)
    print("🌍 Duolingo Real Data Fetcher")
    print("=" * 60)
    
    # Try different username variations
    usernames = ['greatjoel', 'joeljoju06']
    
    for username in usernames:
        print(f"\n📌 Trying username: {username}")
        print("-" * 40)
        
        # Get real data
        real_data = get_real_duolingo_data(username)
        
        if real_data:
            print("\n✅ REAL DATA FOUND!")
            print("=" * 40)
            
            # Print summary
            print(f"👤 Username: {real_data['username']}")
            print(f"⭐ Total XP: {real_data['total_xp']}")
            print(f"🔥 Streak: {real_data['streak']} days")
            print(f"📚 Languages: {', '.join(real_data['languages'])}")
            print(f"🌍 Learning: {real_data['learning_language']}")
            
            print("\n📊 Language Progress:")
            for lang, progress in real_data['language_progress'].items():
                print(f"   {lang.upper()}: Level {progress['level']}, {progress['points']} XP")
            
            # Save to JSON file
            with open('duolingo_real_data.json', 'w') as f:
                json.dump(real_data, f, indent=2)
            
            print(f"\n💾 Saved to: duolingo_real_data.json")
            
            # Also save the raw data
            with open('duolingo_raw_data.json', 'w') as f:
                json.dump(real_data['full_data'], f, indent=2)
            
            print(f"💾 Raw data saved to: duolingo_raw_data.json")
            break
        else:
            print(f"❌ Could not get data for {username}")
    
    print("\n" + "=" * 60)
    print("✅ Complete! Check duolingo_real_data.json for your data")
    print("=" * 60)