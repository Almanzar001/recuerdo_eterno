const axios = require('axios');
const https = require('https');

// You need to set these environment variables or hardcode them temporarily
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = process.env.NOCODB_TOKEN || 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
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
    rejectUnauthorized: false // Allow self-signed certificates
  }),
  timeout: 30000,
});

async function inspectTables() {
  try {
    console.log('=== INSPECTING NOCODB TABLES ===\n');
    
    // First, get all tables to find correct IDs
    try {
      const tables = await nocodbApi.get(`/meta/bases/${BASE_ID}/tables`);
      console.log('Available tables:');
      tables.data.list.forEach(table => {
        console.log(`  - ${table.table_name} (${table.id})`);
      });
      console.log('\n');
    } catch (error) {
      console.log('Error getting tables:', error.response?.data || error.message);
    }
    
    // Get table info for each table
    for (const [tableName, tableId] of Object.entries(TABLE_IDS)) {
      console.log(`--- ${tableName.toUpperCase()} TABLE (${tableId}) ---`);
      
      try {
        // Get table metadata
        const tableInfo = await nocodbApi.get(`/meta/tables/${tableId}`);
        const columns = tableInfo.data.columns;
        
        console.log('Columns:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.uidt}) ${col.pk ? '[PK]' : ''} ${col.rqd ? '[REQUIRED]' : ''}`);
          if (col.colOptions && col.colOptions.fk_related_model_id) {
            console.log(`    -> Related to table: ${col.colOptions.fk_related_model_id}`);
          }
        });
        
        // Get some sample records
        const records = await nocodbApi.get(`/tables/${tableId}/records?limit=2`);
        console.log('\nSample records:');
        if (records.data.list && records.data.list.length > 0) {
          console.log(JSON.stringify(records.data.list[0], null, 2));
        } else {
          console.log('  No records found');
        }
        
      } catch (error) {
        console.log(`Error inspecting ${tableName}:`, error.response?.data || error.message);
      }
      
      console.log('\n');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

inspectTables();