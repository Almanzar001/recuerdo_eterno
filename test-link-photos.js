const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2';

const TABLE_IDS = {
  clientes: 'm9k7d1uhlz5wxpc',
  difuntos: 'm3civgj4b06c2oi',
  fotos: 'm28pnulcjvsb2wq',
  comentarios: 'mai0fn0vh9mrd84'
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

async function testLinking() {
  try {
    console.log('=== TESTING PHOTO LINKING ===\n');
    
    // Try to link photo ID 4 to difunto ID 1 using PATCH
    console.log('1. Attempting to link photo 4 to difunto 1 using PATCH...');
    
    try {
      const linkResponse = await nocodbApi.patch(`/tables/${TABLE_IDS.fotos}/records/4`, {
        Difuntos: 1
      });
      console.log('Link successful:', linkResponse.data);
      
      // Also link photos 5, 6, 7
      for (let photoId = 5; photoId <= 7; photoId++) {
        console.log(`Linking photo ${photoId}...`);
        const response = await nocodbApi.patch(`/tables/${TABLE_IDS.fotos}/records/${photoId}`, {
          Difuntos: 1
        });
        console.log(`Photo ${photoId} linked successfully`);
      }
      
    } catch (linkError) {
      console.error('Link failed:', linkError.response?.data || linkError.message);
    }
    
    // Check if the link worked by getting difunto 1 again
    console.log('\n3. Checking if link worked...');
    const difuntoCheck = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
    const fotosRelation = difuntoCheck.data['nc_0in____nc_m2m_difuntos_fotos'] || [];
    console.log('Number of linked photos:', fotosRelation.length);
    
    fotosRelation.forEach((rel, index) => {
      console.log(`Photo ${index + 1}: ID ${rel.Fotos.ID}, URL: ${rel.Fotos.URL.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error testing linking:', error.response?.data || error.message);
  }
}

testLinking();