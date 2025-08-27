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

async function debugFields() {
  try {
    console.log('=== DEBUGGING TABLE FIELDS ===\n');
    
    // Get table metadata for each table
    for (const [tableName, tableId] of Object.entries(TABLE_IDS)) {
      console.log(`--- ${tableName.toUpperCase()} TABLE ---`);
      
      try {
        const tableInfo = await nocodbApi.get(`/meta/tables/${tableId}`);
        const columns = tableInfo.data.columns;
        
        console.log('Available fields:');
        columns.forEach(col => {
          if (col.uidt === 'LinkToAnotherRecord' || col.uidt === 'Links') {
            console.log(`  - ${col.column_name} (${col.uidt}) -> Related table: ${col.colOptions?.fk_related_model_id || 'unknown'}`);
          } else {
            console.log(`  - ${col.column_name} (${col.uidt})`);
          }
        });
        
        // Get a sample record to see actual field names
        const sampleRecord = await nocodbApi.get(`/tables/${tableId}/records?limit=1`);
        if (sampleRecord.data.list && sampleRecord.data.list.length > 0) {
          console.log('\nSample record fields:');
          console.log(Object.keys(sampleRecord.data.list[0]).join(', '));
        }
        
      } catch (error) {
        console.error(`Error getting ${tableName} info:`, error.response?.data || error.message);
      }
      
      console.log('\n');
    }
    
    // Test creating a difunto with client link
    console.log('=== TESTING DIFUNTO CREATION ===');
    
    const testDifuntoData = {
      nombre: 'Test Usuario',
      fecha_nacimiento: '1980-01-01',
      fecha_fallecimiento: '2024-01-01', 
      historia: 'Usuario de prueba',
      Clientes: 1  // Try linking to client 1
    };
    
    console.log('Attempting to create difunto:', testDifuntoData);
    
    try {
      const createResult = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records`, testDifuntoData);
      console.log('Difunto created successfully:', createResult.data);
    } catch (error) {
      console.error('Failed to create difunto:', error.response?.data || error.message);
      
      // Try without the link
      console.log('\nTrying without client link...');
      const { Clientes, ...dataWithoutLink } = testDifuntoData;
      try {
        const createResult2 = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records`, dataWithoutLink);
        console.log('Difunto created without link:', createResult2.data);
      } catch (error2) {
        console.error('Still failed:', error2.response?.data || error2.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugFields();