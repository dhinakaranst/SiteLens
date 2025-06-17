const axios = require('axios');

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'https://your-render-app-name.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

console.log(`🔄 Starting keep-alive script for: ${SERVER_URL}`);
console.log(`⏰ Pinging every ${PING_INTERVAL / 60000} minutes`);

const pingServer = async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/wake`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'KeepAlive-Script/1.0'
      }
    });
    
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Server ping successful: ${response.status}`);
    
    if (response.data) {
      console.log(`📊 Server status: ${response.data.status}`);
    }
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.log(`❌ [${timestamp}] Server ping failed:`, error.message);
  }
};

// Ping immediately
pingServer();

// Then ping every 14 minutes
setInterval(pingServer, PING_INTERVAL);

console.log('🚀 Keep-alive script is running. Press Ctrl+C to stop.'); 