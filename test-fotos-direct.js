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

async function testPhotoRetrieval() {
  try {
    console.log('=== TESTING PHOTO RETRIEVAL ===\n');
    
    // Test our method
    console.log('1. Testing getFotosByDifunto method:');
    const difuntoResponse = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
    const difunto = difuntoResponse.data;
    
    console.log('Difunto response:', JSON.stringify(difunto, null, 2));
    
    const fotosRelation = difunto['nc_0in____nc_m2m_difuntos_fotos'] || [];
    console.log('Photos relation data:', fotosRelation);
    
    const fotos = fotosRelation.map(rel => rel.Fotos).filter(foto => foto);
    console.log('Extracted photos:', fotos);
    
    // Test direct photos table query
    console.log('\n2. Testing direct photos table query:');
    const directFotos = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records`);
    console.log('Direct photos:', directFotos.data);
    
  } catch (error) {
    console.error('Error testing photo retrieval:', error.response?.data || error.message);
  }
}

testPhotoRetrieval();