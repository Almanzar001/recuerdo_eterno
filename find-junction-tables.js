const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2';

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

async function findJunctionTables() {
  try {
    console.log('=== FINDING JUNCTION TABLES ===\n');
    
    // Get all tables to find junction tables
    const tables = await nocodbApi.get(`/meta/bases/${BASE_ID}/tables`);
    console.log('All tables:');
    tables.data.list.forEach(table => {
      console.log(`  - ${table.table_name} (${table.id})`);
    });
    
    // Look for junction tables (usually start with nc_ or mm_)
    const junctionTables = tables.data.list.filter(table => 
      table.table_name.includes('nc_') || table.table_name.includes('mm_')
    );
    
    console.log('\nPossible junction tables:');
    junctionTables.forEach(table => {
      console.log(`  - ${table.table_name} (${table.id})`);
    });
    
    // Try to create a record in the difuntos_fotos junction table
    // From the inspection, the relation is named nc_0in____nc_m2m_difuntos_fotos
    console.log('\n=== ATTEMPTING JUNCTION TABLE INSERT ===');
    
    // Find a junction table that looks like difuntos_fotos
    const possibleJunctionTable = junctionTables.find(table => 
      table.table_name.includes('difuntos') && table.table_name.includes('fotos')
    );
    
    if (possibleJunctionTable) {
      console.log(`Found junction table: ${possibleJunctionTable.table_name}`);
      
      // Get its structure
      const junctionInfo = await nocodbApi.get(`/meta/tables/${possibleJunctionTable.id}`);
      console.log('Junction table fields:');
      junctionInfo.data.columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.uidt})`);
      });
      
      // Try to create a record
      const junctionData = {
        'nc_0in____difuntos_id': 2,
        'nc_0in____fotos_id': 4
      };
      
      console.log('Attempting to create junction record:', junctionData);
      
      try {
        const junctionResult = await nocodbApi.post(`/tables/${possibleJunctionTable.id}/records`, junctionData);
        console.log('Junction record created:', junctionResult.data);
        
        // Verify the link worked
        const difuntoCheck = await nocodbApi.get('/tables/m3civgj4b06c2oi/records/2');
        console.log('Difunto fotos after junction:', difuntoCheck.data.fotos);
        
      } catch (junctionError) {
        console.error('Junction creation failed:', junctionError.response?.data || junctionError.message);
      }
      
    } else {
      console.log('No obvious junction table found');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

findJunctionTables();