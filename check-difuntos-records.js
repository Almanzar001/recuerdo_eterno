const axios = require('axios');
const https = require('https');

// NocoDB configuration
const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2';
const DIFUNTOS_TABLE_ID = 'm3civgj4b06c2oi';

// Create axios instance for NocoDB with SSL handling
const nocodbApi = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v2`,
  headers: {
    'xc-token': NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates
  }),
  timeout: 30000, // 30 second timeout
});

async function checkDifuntosRecords() {
  console.log('🔍 Checking existing difuntos records...\n');
  
  try {
    // Get all difuntos records
    console.log(`📡 Making request to: ${NOCODB_BASE_URL}/api/v2/tables/${DIFUNTOS_TABLE_ID}/records`);
    const response = await nocodbApi.get(`/tables/${DIFUNTOS_TABLE_ID}/records`);
    
    console.log('✅ Connection successful!');
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📈 Total records found: ${response.data.list ? response.data.list.length : 0}\n`);
    
    if (response.data.list && response.data.list.length > 0) {
      console.log('📋 Current difuntos records:');
      console.log('=' .repeat(80));
      
      response.data.list.forEach((difunto, index) => {
        console.log(`\n${index + 1}. Record ID: ${difunto.ID || 'No ID'}`);
        console.log(`   Nombre: ${difunto.nombre || 'No name'}`);
        console.log(`   Fecha Nacimiento: ${difunto.fecha_nacimiento || 'No birth date'}`);
        console.log(`   Fecha Fallecimiento: ${difunto.fecha_fallecimiento || 'No death date'}`);
        console.log(`   Historia: ${difunto.historia ? difunto.historia.substring(0, 100) + '...' : 'No history'}`);
        console.log(`   Cliente ID: ${difunto.Clientes || 'No client linked'}`);
        console.log(`   Created: ${difunto.created_at || 'No creation date'}`);
        console.log(`   Updated: ${difunto.updated_at || 'No update date'}`);
        console.log('   ' + '-'.repeat(60));
      });
      
      console.log('\n📊 Summary:');
      console.log(`   - Total records: ${response.data.list.length}`);
      console.log(`   - Available IDs: ${response.data.list.map(d => d.ID).join(', ')}`);
      
      // Check specifically for ID 8
      const record8 = response.data.list.find(d => d.ID === 8);
      if (record8) {
        console.log('\n✅ Record with ID 8 EXISTS:');
        console.log(JSON.stringify(record8, null, 2));
      } else {
        console.log('\n❌ Record with ID 8 NOT FOUND');
        console.log('   This explains why you\'re getting a 404 error when trying to access difunto ID 8');
      }
      
    } else {
      console.log('📭 No difuntos records found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error checking difuntos records:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Message:', error.message);
    
    if (error.response?.data) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Possible reasons for 404:');
      console.log('   - Table ID might be incorrect');
      console.log('   - Base ID might be incorrect');
      console.log('   - Authentication token might be invalid');
      console.log('   - The table might not exist');
    }
  }
}

async function testSpecificRecord() {
  console.log('\n🎯 Testing specific record access (ID 8)...\n');
  
  try {
    const response = await nocodbApi.get(`/tables/${DIFUNTOS_TABLE_ID}/records/8`);
    console.log('✅ Record 8 found:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Cannot access record 8:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 404) {
      console.log('   ✓ Confirmed: Record with ID 8 does not exist');
    }
  }
}

async function main() {
  console.log('🚀 NocoDB Difuntos Records Check');
  console.log('=' .repeat(50));
  console.log(`🌐 Server: ${NOCODB_BASE_URL}`);
  console.log(`🗄️  Base ID: ${BASE_ID}`);
  console.log(`📋 Table ID: ${DIFUNTOS_TABLE_ID}`);
  console.log('=' .repeat(50));
  
  await checkDifuntosRecords();
  await testSpecificRecord();
  
  console.log('\n✨ Check completed!');
}

main().catch(console.error);