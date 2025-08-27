const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2';

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

async function testPhotoCreation() {
  try {
    console.log('=== TESTING PHOTO CREATION ===\n');
    
    // Test creating a photo with difunto link
    const testPhotoData = {
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      descripcion: 'Test Photo',
      orden: 99,
      Difuntos: 2  // Link to the difunto we just created
    };
    
    console.log('Attempting to create photo:', { ...testPhotoData, url: 'data:image/...(truncated)' });
    
    try {
      const createResult = await nocodbApi.post(`/tables/${TABLE_IDS.fotos}/records`, testPhotoData);
      console.log('Photo created successfully:', createResult.data);
      
      // Verify the photo was linked by checking the difunto
      console.log('\nVerifying photo link...');
      const difuntoCheck = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/2`);
      console.log('Difunto fotos count:', difuntoCheck.data.fotos || 0);
      
      // Also check direct query
      const fotosQuery = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where=(Difuntos,eq,2)`);
      console.log('Direct photo query results:', fotosQuery.data.list?.length || 0);
      
    } catch (error) {
      console.error('Failed to create photo:', error.response?.data || error.message);
      
      // Try without the link
      console.log('\nTrying without difunto link...');
      const { Difuntos, ...dataWithoutLink } = testPhotoData;
      try {
        const createResult2 = await nocodbApi.post(`/tables/${TABLE_IDS.fotos}/records`, dataWithoutLink);
        console.log('Photo created without link:', createResult2.data);
        
        // Now try to link it manually
        const photoId = createResult2.data.ID;
        console.log(`\nTrying to link photo ${photoId} to difunto 2...`);
        
        try {
          const linkResult = await nocodbApi.patch(`/tables/${TABLE_IDS.fotos}/records/${photoId}`, {
            Difuntos: 2
          });
          console.log('Manual link successful:', linkResult.data);
        } catch (linkError) {
          console.error('Manual link failed:', linkError.response?.data || linkError.message);
        }
        
      } catch (error2) {
        console.error('Still failed:', error2.response?.data || error2.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testPhotoCreation();