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

async function testAttachmentSystem() {
  try {
    console.log('=== TESTING ATTACHMENT SYSTEM ===\n');
    
    // 1. Check if the pruebafoto field exists
    console.log('1. Checking attachment field structure...');
    const tableInfo = await nocodbApi.get(`/meta/tables/${TABLE_IDS.difuntos}`);
    const attachmentField = tableInfo.data.columns.find(col => 
      col.column_name === 'pruebafoto' || col.title === 'pruebafoto'
    );
    
    if (attachmentField) {
      console.log('✓ Pruebafoto field found:', {
        name: attachmentField.column_name,
        title: attachmentField.title,
        type: attachmentField.uidt
      });
    } else {
      console.log('✗ Pruebafoto field not found');
      console.log('Available attachment fields:');
      tableInfo.data.columns
        .filter(col => col.uidt === 'Attachment')
        .forEach(col => {
          console.log(`  - ${col.title} (${col.column_name})`);
        });
    }
    
    // 2. Test reading difunto 1 to see attachment field
    console.log('\n2. Reading difunto 1 to check attachment data...');
    const difunto1 = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/1`);
    const difunto = difunto1.data;
    
    console.log('Difunto 1 fields with "foto" in name:');
    Object.keys(difunto).forEach(key => {
      if (key.toLowerCase().includes('foto')) {
        console.log(`  - ${key}:`, typeof difunto[key], difunto[key]);
      }
    });
    
    // 3. Test creating a difunto with attachment
    console.log('\n3. Testing difunto creation with attachment...');
    
    // Create a test image as base64
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testAttachment = {
      title: 'Test Attachment Photo',
      mimetype: 'image/png',
      size: 100,
      data: `data:image/png;base64,${testImageBase64}`,
      url: `data:image/png;base64,${testImageBase64}`
    };
    
    const newDifuntoData = {
      nombre: 'Test Attachment User',
      fecha_nacimiento: '1990-01-01',
      fecha_fallecimiento: '2024-01-01',
      historia: 'Testing attachment system',
      pruebafoto: [testAttachment]
    };
    
    try {
      const createResult = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records`, newDifuntoData);
      console.log('✓ Difunto created with attachment:', createResult.data.ID);
      
      // Verify the attachment was saved
      const verifyResult = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${createResult.data.ID}`);
      console.log('Attachment field after creation:', verifyResult.data.pruebafoto);
      
    } catch (createError) {
      console.error('✗ Difunto creation failed:', createError.response?.data || createError.message);
    }
    
    // 4. Test the new getFotosByDifunto function
    console.log('\n4. Testing new getFotosByDifunto function via local API...');
    try {
      const localResponse = await axios.get('http://localhost:3003/api/fotos/1', { timeout: 5000 });
      console.log('✓ Local API response:', {
        photoCount: localResponse.data.list.length,
        firstPhotoHasUrl: !!localResponse.data.list[0]?.url
      });
    } catch (localError) {
      console.log('✗ Local API failed:', localError.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testAttachmentSystem();