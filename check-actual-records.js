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

async function checkActualRecords() {
  try {
    console.log('=== CHECKING ACTUAL RECORDS AND TESTING DELETE ===\n');
    
    // 1. Get all tables and their IDs
    const tablesResponse = await nocodbApi.get(`/meta/bases/${BASE_ID}/tables`);
    const tables = tablesResponse.data.list || tablesResponse.data || [];
    
    const difuntosTable = tables.find(t => t.table_name === 'difuntos');
    const clientesTable = tables.find(t => t.table_name === 'clientes');
    
    console.log('Table IDs:');
    console.log(`- Difuntos: ${difuntosTable?.id}`);
    console.log(`- Clientes: ${clientesTable?.id}`);
    
    if (!difuntosTable) {
      console.log('❌ Difuntos table not found!');
      return;
    }
    
    // 2. Get all difunto records with their actual IDs
    console.log('\n2. All difunto records:');
    const difuntosRecords = await nocodbApi.get(`/tables/${difuntosTable.id}/records`);
    const difuntos = difuntosRecords.data.list || [];
    
    console.log(`Found ${difuntos.length} difunto records:`);
    difuntos.forEach(d => {
      console.log(`  - ID: ${d.ID}, nombre: "${d.nombre}", cliente: ${d.Cliente || 'none'}`);
    });
    
    if (difuntos.length > 0) {
      // 3. Test delete with a valid ID
      const testDifunto = difuntos.find(d => d.ID === 8) || difuntos[0];
      console.log(`\n3. Testing delete with valid ID: ${testDifunto.ID}`);
      
      // First, check what might be referencing this difunto
      if (clientesTable) {
        const clientesRecords = await nocodbApi.get(`/tables/${clientesTable.id}/records`);
        const clientes = clientesRecords.data.list || [];
        
        console.log('\nChecking clientes for relationships:');
        clientes.forEach(cliente => {
          console.log(`Cliente ${cliente.ID}: `, Object.keys(cliente).filter(k => k.includes('nc_') || k.includes('difunto')));
        });
      }
      
      // Get detailed record to see all relationships
      console.log('\n4. Detailed difunto record before delete:');
      const detailedRecord = await nocodbApi.get(`/tables/${difuntosTable.id}/records/${testDifunto.ID}`);
      const record = detailedRecord.data;
      
      console.log('All fields in record:');
      Object.keys(record).forEach(key => {
        const value = record[key];
        if (Array.isArray(value)) {
          console.log(`  - ${key}: array with ${value.length} items`);
        } else {
          console.log(`  - ${key}: ${typeof value} (${value})`);
        }
      });
      
      // 5. Try delete and capture full error
      console.log('\n5. Attempting delete...');
      try {
        const deleteResult = await nocodbApi.delete(`/tables/${difuntosTable.id}/records/${testDifunto.ID}`);
        console.log('✅ Delete successful!', deleteResult.data);
      } catch (deleteError) {
        console.log('❌ Delete failed with detailed error:');
        console.log('Status:', deleteError.response?.status);
        console.log('Status Text:', deleteError.response?.statusText);
        console.log('Error Data:', JSON.stringify(deleteError.response?.data, null, 2));
        console.log('Raw Error Message:', deleteError.message);
        
        // Check for specific constraint violations
        const errorStr = JSON.stringify(deleteError.response?.data || {});
        if (errorStr.includes('foreign') || errorStr.includes('constraint') || errorStr.includes('relationship')) {
          console.log('\n🚨 FOREIGN KEY CONSTRAINT DETECTED');
        }
      }
    }
    
  } catch (error) {
    console.error('Fatal error:', error.response?.data || error.message);
  }
}

checkActualRecords();