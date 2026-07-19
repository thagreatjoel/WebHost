// pages/api/duolingo-status.js

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // Test the proxy
    const response = await fetch('https://duolingo-proxy.vercel.app/users/greatjoel');
    const success = response.ok;
    
    res.status(200).json({
      status: success ? 'healthy' : 'degraded',
      proxy: success ? 'online' : 'offline',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(200).json({
      status: 'degraded',
      proxy: 'offline',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}