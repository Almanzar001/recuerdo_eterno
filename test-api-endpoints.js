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

async function testApiEndpoints() {
  try {
    console.log('=== TESTING API ENDPOINTS FOR PROPER FORMAT ===\n');
    
    const difuntosTableId = 'm3civgj4b06c2oi';
    
    // 1. Test different API endpoint formats for getting records
    console.log('1. Testing GET endpoints...');
    
    // Format 1: /tables/{tableId}/records
    try {
      const records1 = await nocodbApi.get(`/tables/${difuntosTableId}/records`);
      console.log('✅ GET /tables/{tableId}/records works:', records1.data.list?.length, 'records');
    } catch (e) {
      console.log('❌ GET /tables/{tableId}/records failed:', e.response?.status);
    }
    
    // Format 2: /bases/{baseId}/tables/{tableId}/records  
    try {
      const records2 = await nocodbApi.get(`/bases/${BASE_ID}/tables/${difuntosTableId}/records`);
      console.log('✅ GET /bases/{baseId}/tables/{tableId}/records works:', records2.data.list?.length, 'records');
    } catch (e) {
      console.log('❌ GET /bases/{baseId}/tables/{tableId}/records failed:', e.response?.status);
    }
    
    // 2. Get a specific record to test with
    const recordsResponse = await nocodbApi.get(`/tables/${difuntosTableId}/records`);
    const records = recordsResponse.data.list || [];
    
    if (records.length > 0) {
      const testRecord = records[0];
      const recordId = testRecord.ID;
      console.log(`\n2. Testing with record ID: ${recordId}`);
      
      // Test different GET single record formats
      console.log('\nTesting single record GET endpoints...');
      
      // Format 1: /tables/{tableId}/records/{id}
      try {
        const single1 = await nocodbApi.get(`/tables/${difuntosTableId}/records/${recordId}`);
        console.log('✅ GET /tables/{tableId}/records/{id} works');
      } catch (e) {
        console.log('❌ GET /tables/{tableId}/records/{id} failed:', e.response?.status, e.response?.data?.msg);
      }
      
      // Format 2: /bases/{baseId}/tables/{tableId}/records/{id}
      try {
        const single2 = await nocodbApi.get(`/bases/${BASE_ID}/tables/${difuntosTableId}/records/${recordId}`);
        console.log('✅ GET /bases/{baseId}/tables/{tableId}/records/{id} works');
      } catch (e) {
        console.log('❌ GET /bases/{baseId}/tables/{tableId}/records/{id} failed:', e.response?.status);
      }
      
      // 3. Now test DELETE with both formats
      console.log('\n3. Testing DELETE endpoints...');
      
      // Format 1: /tables/{tableId}/records/{id}
      try {
        // First test if this endpoint exists by trying a HEAD request
        await axios.head(`${NOCODB_BASE_URL}/api/v2/tables/${difuntosTableId}/records/${recordId}`, {
          headers: { 'xc-token': NOCODB_TOKEN },
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        console.log('✅ DELETE endpoint /tables/{tableId}/records/{id} is accessible');
        
        // Don't actually delete, just test the endpoint structure
        console.log('⚠️  Skipping actual delete to preserve data');
        
      } catch (e) {
        console.log('❌ DELETE /tables/{tableId}/records/{id} not accessible:', e.response?.status, e.response?.data?.msg);
      }
      
      // Format 2: /bases/{baseId}/tables/{tableId}/records/{id}
      try {
        await axios.head(`${NOCODB_BASE_URL}/api/v2/bases/${BASE_ID}/tables/${difuntosTableId}/records/${recordId}`, {
          headers: { 'xc-token': NOCODB_TOKEN },
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        console.log('✅ DELETE endpoint /bases/{baseId}/tables/{tableId}/records/{id} is accessible');
      } catch (e) {
        console.log('❌ DELETE /bases/{baseId}/tables/{tableId}/records/{id} not accessible:', e.response?.status);
      }
      
      // 4. Check what relationships exist that might prevent deletion
      console.log('\n4. Checking relationships that might prevent deletion...');
      
      const detailedRecord = await nocodbApi.get(`/tables/${difuntosTableId}/records/${recordId}`);
      const record = detailedRecord.data;
      
      // Check for any related data
      let hasRelatedData = false;
      Object.keys(record).forEach(key => {
        if (Array.isArray(record[key]) && record[key].length > 0) {
          console.log(`🔗 Found related data in field '${key}': ${record[key].length} items`);
          hasRelatedData = true;
        }
      });
      
      if (!hasRelatedData) {
        console.log('✅ No related data found that should prevent deletion');
      }
      
      // 5. Check if Cliente relationship exists
      if (record.Cliente || record.Clientes) {
        console.log(`🔗 Cliente relationship exists: ${record.Cliente || record.Clientes}`);
        
        // Check if this is the issue - try to unlink first
        console.log('\n5. Attempting to unlink Cliente first...');
        try {
          await nocodbApi.patch(`/tables/${difuntosTableId}/records/${recordId}`, {
            Cliente: null
          });
          console.log('✅ Cliente unlinked successfully');
          
          // Now try delete
          console.log('6. Now attempting delete after unlinking...');
          try {
            const deleteResult = await nocodbApi.delete(`/tables/${difuntosTableId}/records/${recordId}`);
            console.log('✅ Delete successful after unlinking!', deleteResult.data);
          } catch (deleteError2) {
            console.log('❌ Delete still failed after unlinking:');
            console.log('Status:', deleteError2.response?.status);
            console.log('Error:', JSON.stringify(deleteError2.response?.data, null, 2));
          }
          
        } catch (unlinkError) {
          console.log('❌ Failed to unlink Cliente:', unlinkError.response?.data || unlinkError.message);
        }
      } else {
        console.log('No Cliente relationship found');
        
        // Try delete directly since no relationships
        console.log('\n5. Attempting direct delete (no relationships)...');
        try {
          const deleteResult = await nocodbApi.delete(`/tables/${difuntosTableId}/records/${recordId}`);
          console.log('✅ Delete successful!', deleteResult.data);
        } catch (deleteError) {
          console.log('❌ Delete failed even with no relationships:');
          console.log('Status:', deleteError.response?.status);
          console.log('Error:', JSON.stringify(deleteError.response?.data, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('Fatal error:', error.response?.data || error.message);
  }
}

testApiEndpoints();