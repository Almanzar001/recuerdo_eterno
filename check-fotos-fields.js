const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const TABLE_IDS = {
  fotos: 'm28pnulcjvsb2wq'
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

async function checkFotosFields() {
  try {
    console.log('=== CHECKING FOTOS TABLE FIELDS ===\n');
    
    // Get fotos table metadata
    const tableInfo = await nocodbApi.get(`/meta/tables/${TABLE_IDS.fotos}`);
    const columns = tableInfo.data.columns;
    
    console.log('Fotos table all fields:');
    columns.forEach(col => {
      console.log(`Field: ${col.column_name || col.title}`);
      console.log(`  - Type: ${col.uidt}`);
      console.log(`  - Title: ${col.title}`);
      if (col.uidt === 'LinkToAnotherRecord' || col.uidt === 'Links') {
        console.log(`  - Related table: ${col.colOptions?.fk_related_model_id}`);
      }
      console.log('---');
    });
    
    // Get a sample fotos record
    const sampleRecord = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records/4`);
    console.log('\nSample photo record (ID 4) fields:');
    Object.keys(sampleRecord.data).forEach(key => {
      console.log(`  - ${key}: ${typeof sampleRecord.data[key]} (${sampleRecord.data[key]})`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkFotosFields();