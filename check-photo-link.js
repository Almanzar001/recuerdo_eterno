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

async function checkPhotoLink() {
  try {
    // Get the photo we just created (ID 4)
    console.log('=== CHECKING PHOTO LINK ===\n');
    
    const photo = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records/4`);
    console.log('Photo record:', photo.data);
    
    // Check if the photo appears when querying by Difuntos field
    console.log('\nQuerying photos by Difuntos = 2:');
    const photosByDifunto = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where=(Difuntos,eq,2)`);
    console.log('Found photos:', photosByDifunto.data.list?.length || 0);
    
    if (photosByDifunto.data.list && photosByDifunto.data.list.length > 0) {
      console.log('Photo data:', photosByDifunto.data.list[0]);
    }
    
    // Check difunto 2
    console.log('\nChecking difunto 2:');
    const difunto = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/2`);
    console.log('Difunto record fotos field:', difunto.data.fotos);
    console.log('Difunto m2m relations:', difunto.data['nc_0in____nc_m2m_difuntos_fotos']?.length || 0);
    
    // Try different query syntax
    console.log('\nTrying different query syntax:');
    try {
      const altQuery = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where[Difuntos][eq]=2`);
      console.log('Alternative query result:', altQuery.data.list?.length || 0);
    } catch (e) {
      console.log('Alternative query failed:', e.response?.data || e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkPhotoLink();