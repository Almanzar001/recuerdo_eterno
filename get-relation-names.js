const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const TABLE_IDS = {
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

async function getRelationNames() {
  try {
    console.log('=== GETTING RELATION NAMES ===\n');
    
    // Get difuntos table metadata
    const tableInfo = await nocodbApi.get(`/meta/tables/${TABLE_IDS.difuntos}`);
    const columns = tableInfo.data.columns;
    
    console.log('Difuntos table relationship fields:');
    
    columns.forEach(col => {
      if (col.uidt === 'LinkToAnotherRecord' || col.uidt === 'Links') {
        console.log(`Field: ${col.column_name}`);
        console.log(`  - Type: ${col.uidt}`);
        console.log(`  - Title: ${col.title}`);
        console.log(`  - Related table: ${col.colOptions?.fk_related_model_id}`);
        console.log(`  - Foreign key: ${col.colOptions?.fk_child_column_id}`);
        console.log(`  - Parent key: ${col.colOptions?.fk_parent_column_id}`);
        console.log(`  - Junction table: ${col.colOptions?.fk_mm_model_id || 'N/A'}`);
        console.log('---');
      }
    });
    
    // Also get a sample record to see actual field names in data
    const sampleRecord = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
    
    console.log('\nSample record relation fields:');
    Object.keys(sampleRecord.data).forEach(key => {
      if (key.includes('nc_') || key === 'Clientes' || key === 'fotos') {
        console.log(`  - ${key}: ${typeof sampleRecord.data[key]} (${sampleRecord.data[key]})`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getRelationNames();