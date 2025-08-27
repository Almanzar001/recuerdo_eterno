// Check existing photos in NocoDB
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

async function checkPhotos() {
  try {
    console.log('📸 Checking photos in NocoDB...\n');
    
    // Get all photos
    const photosResponse = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records`);
    const photos = photosResponse.data.list || [];
    
    console.log(`📊 Found ${photos.length} photos in database:`);
    
    if (photos.length > 0) {
      photos.forEach((photo, index) => {
        console.log(`\n📷 Photo ${index + 1}:`);
        console.log(`  ID: ${photo.ID}`);
        console.log(`  URL: ${photo.URL}`);
        console.log(`  Descripción: ${photo.Descripción}`);
        console.log(`  Orden: ${photo.Orden}`);
        console.log(`  Raw data:`, JSON.stringify(photo, null, 2));
      });
    } else {
      console.log('No photos found in database');
    }
    
    // Also check difunto to see if it has photo relationships
    console.log('\n👤 Checking difunto relationships...');
    const difuntoResponse = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
    console.log('Difunto data:', JSON.stringify(difuntoResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error checking photos:', error.response?.data?.msg || error.message);
  }
}

checkPhotos();