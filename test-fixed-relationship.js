const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const TABLE_IDS = {
  fotos: 'm28pnulcjvsb2wq',
  difuntos: 'm3civgj4b06c2oi'
};

const nocodbApi = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v2`,
  headers: {
    'xc-token': NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 30000,
});

async function testFixedRelationship() {
  try {
    console.log('=== TESTING FIXED RELATIONSHIP ===\n');
    
    // 1. Test the fixed getFotosByDifunto logic
    console.log('1. Testing fixed getFotosByDifunto logic for difunto 1...');
    
    // Direct query (this was working)
    const directQuery = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where=(Difuntos,eq,1)`);
    console.log('Direct query found:', directQuery.data.list.length, 'photos');
    
    directQuery.data.list.forEach(foto => {
      console.log(`  - Foto ID ${foto.ID}: Difuntos=${foto.Difuntos}, has_url=${!!foto.url}`);
    });
    
    // 2. Test creating a new photo with difunto relationship
    console.log('\n2. Testing new photo creation with relationship...');
    
    const newPhotoData = {
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      descripcion: 'Test relationship photo',
      orden: 99,
      Difuntos: 1  // Set relationship during creation
    };
    
    try {
      const newPhoto = await nocodbApi.post(`/tables/${TABLE_IDS.fotos}/records`, newPhotoData);
      console.log('New photo created with ID:', newPhoto.data.ID);
      console.log('New photo Difuntos field:', newPhoto.data.Difuntos);
      
      // 3. Verify the new photo appears in query
      console.log('\n3. Verifying new photo appears in query...');
      const updatedQuery = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where=(Difuntos,eq,1)`);
      console.log('Updated query found:', updatedQuery.data.list.length, 'photos');
      
      const newPhotoInQuery = updatedQuery.data.list.find(p => p.ID === newPhoto.data.ID);
      if (newPhotoInQuery) {
        console.log('✓ New photo appears in query results');
      } else {
        console.log('✗ New photo NOT in query results');
      }
      
    } catch (createError) {
      console.error('Photo creation failed:', createError.response?.data || createError.message);
    }
    
    // 4. Test the local API endpoint
    console.log('\n4. Testing local API endpoint...');
    try {
      const localResponse = await axios.get('http://localhost:3003/api/fotos/1', { timeout: 5000 });
      console.log('Local API returned:', localResponse.data.list.length, 'photos for difunto 1');
      
      localResponse.data.list.forEach((foto, index) => {
        console.log(`  - Photo ${index + 1}: ID=${foto.ID}, has_url=${!!foto.url}`);
      });
      
    } catch (localError) {
      console.log('Local API test failed:', localError.message);
    }
    
    console.log('\n=== RELATIONSHIP TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testFixedRelationship();