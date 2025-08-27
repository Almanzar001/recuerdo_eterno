const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2';

// Try v1 API instead of v2
const nocodbApiV1 = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v1`,
  headers: {
    'xc-token': NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 30000,
});

async function testV1Api() {
  try {
    console.log('=== TESTING V1 API FOR DELETE OPERATIONS ===\n');
    
    const difuntosTableId = 'm3civgj4b06c2oi';
    
    // 1. Test v1 endpoints
    console.log('1. Testing V1 API patterns...');
    
    const v1Patterns = [
      `/db/data/${BASE_ID}/difuntos/8`,
      `/db/data/${BASE_ID}/${difuntosTableId}/8`,
      `/data/${BASE_ID}/difuntos/8`,
      `/data/${BASE_ID}/${difuntosTableId}/8`
    ];
    
    for (const pattern of v1Patterns) {
      try {
        console.log(`Testing GET v1 pattern: ${pattern}`);
        const result = await nocodbApiV1.get(pattern);
        console.log(`✅ GET v1 ${pattern} works!`);
        
        // If GET works, test DELETE
        console.log(`Testing DELETE v1 pattern: ${pattern}`);
        try {
          const deleteResult = await nocodbApiV1.delete(pattern);
          console.log(`🎉 DELETE v1 ${pattern} WORKS!`, deleteResult.data);
        } catch (deleteError) {
          console.log(`❌ DELETE v1 ${pattern} failed:`, deleteError.response?.status, deleteError.response?.data?.message);
        }
        
      } catch (getError) {
        console.log(`❌ GET v1 ${pattern} failed:`, getError.response?.status);
      }
    }
    
    // 2. Also test if the issue is with NocoDB configuration
    console.log('\n2. Testing if DELETE method is allowed...');
    
    // Check allowed methods
    try {
      const optionsResult = await axios.options(`${NOCODB_BASE_URL}/api/v2/tables/${difuntosTableId}/records/8`, {
        headers: { 'xc-token': NOCODB_TOKEN },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      console.log('Allowed methods:', optionsResult.headers.allow);
    } catch (optError) {
      console.log('OPTIONS request failed:', optError.response?.status);
    }
    
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

testV1Api();