const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const TABLE_IDS = {
  fotos: 'm28pnulcjvsb2wq',
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

async function debugRelationshipIssue() {
  try {
    console.log('=== DEBUGGING RELATIONSHIP ISSUE ===\n');
    
    // 1. Check what photos exist and their difunto links
    console.log('1. Current photos and their difunto relationships:');
    const allFotos = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records`);
    
    allFotos.data.list.forEach(foto => {
      console.log(`Foto ID ${foto.ID}: Difuntos=${foto.Difuntos}, url=${foto.url ? 'has_url' : 'no_url'}`);
    });
    
    // 2. Check specific difunto 1 and its relationships
    console.log('\n2. Difunto 1 detailed relationships:');
    const difunto1 = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
    const difunto = difunto1.data;
    
    console.log('Available fields:', Object.keys(difunto));
    console.log('Clientes field:', difunto.Clientes);
    console.log('fotos field:', difunto.fotos);
    console.log('M2M difuntos_fotos:', difunto['nc_0in____nc_m2m_difuntos_fotos']?.length || 0);
    console.log('M2M clientes_difuntos:', difunto['nc_0in____nc_m2m_clientes_difuntos']?.length || 0);
    
    // 3. Try to manually set Difuntos field on a photo
    console.log('\n3. Attempting to manually link photo to difunto...');
    
    // Find a photo that's not linked (Difuntos = 0 or null)
    const unlinkedPhoto = allFotos.data.list.find(foto => 
      foto.Difuntos === 0 || foto.Difuntos === null
    );
    
    if (unlinkedPhoto) {
      console.log(`Found unlinked photo ${unlinkedPhoto.ID}, attempting to link to difunto 1`);
      
      try {
        // Try to update the Difuntos field directly
        const updateResult = await nocodbApi.patch(
          `/tables/${TABLE_IDS.fotos}/records/${unlinkedPhoto.ID}`, 
          { Difuntos: 1 }
        );
        console.log('Direct field update successful:', updateResult.data.Difuntos);
        
        // Verify the update worked
        const updatedPhoto = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records/${unlinkedPhoto.ID}`);
        console.log('Photo after update - Difuntos field:', updatedPhoto.data.Difuntos);
        
        // Check if difunto now shows the relationship
        const updatedDifunto = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
        console.log('Difunto fotos count after update:', updatedDifunto.data.fotos);
        
      } catch (updateError) {
        console.error('Direct field update failed:', updateError.response?.data || updateError.message);
      }
    } else {
      console.log('No unlinked photos found to test with');
    }
    
    // 4. Test the getFotosByDifunto logic again
    console.log('\n4. Testing getFotosByDifunto logic:');
    
    // Method 2: Direct query approach
    try {
      const directQuery = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where=(Difuntos,eq,1)`);
      console.log('Direct query result:', directQuery.data.list.length, 'photos found');
    } catch (queryError) {
      console.log('Direct query failed:', queryError.response?.data || queryError.message);
    }
    
    // Alternative query formats
    try {
      const altQuery1 = await nocodbApi.get(`/tables/${TABLE_IDS.fotos}/records?where=(Difuntos,eq,'1')`);
      console.log('String query result:', altQuery1.data.list.length, 'photos found');
    } catch (altError) {
      console.log('String query failed:', altError.response?.data || altError.message);
    }
    
  } catch (error) {
    console.error('Debug error:', error.response?.data || error.message);
  }
}

debugRelationshipIssue();