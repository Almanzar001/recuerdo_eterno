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

async function testCorrectedAttachment() {
  try {
    console.log('=== TESTING CORRECTED ATTACHMENT SYSTEM ===\n');
    
    // 1. Test creating a difunto with fotos_attachment field
    console.log('1. Testing difunto creation with fotos_attachment...');
    
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testAttachment = {
      title: 'Test Attachment Photo',
      mimetype: 'image/png',
      size: 100,
      data: `data:image/png;base64,${testImageBase64}`,
      url: `data:image/png;base64,${testImageBase64}`
    };
    
    const newDifuntoData = {
      nombre: 'Test Corrected Attachment',
      fecha_nacimiento: '1990-01-01',
      fecha_fallecimiento: '2024-01-01',
      historia: 'Testing corrected attachment system',
      fotos_attachment: [testAttachment]  // Using correct field name
    };
    
    try {
      const createResult = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records`, newDifuntoData);
      console.log('✓ Difunto created with attachment:', createResult.data.ID);
      
      // Verify the attachment was saved
      const verifyResult = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${createResult.data.ID}`);
      console.log('Fotos attachment field after creation:');
      console.log('  Type:', typeof verifyResult.data.fotos_attachment);
      console.log('  Content:', verifyResult.data.fotos_attachment);
      console.log('  Alternative field (Fotos):', verifyResult.data.Fotos);
      
      if (verifyResult.data.fotos_attachment || verifyResult.data.Fotos) {
        console.log('✓ Attachment field has data');
        
        // Test the local API with this difunto
        console.log('\n2. Testing local API with new difunto...');
        try {
          const localResponse = await axios.get(`http://localhost:3003/api/fotos/${createResult.data.ID}`, { timeout: 5000 });
          console.log('✓ Local API response:', {
            photoCount: localResponse.data.list.length,
            photos: localResponse.data.list.map(photo => ({
              id: photo.ID,
              hasUrl: !!photo.url,
              description: photo.descripcion
            }))
          });
        } catch (localError) {
          console.log('✗ Local API failed:', localError.message);
        }
        
      } else {
        console.log('✗ No attachment data found after creation');
      }
      
    } catch (createError) {
      console.error('✗ Difunto creation failed:', createError.response?.data || createError.message);
    }
    
    // 3. Test the local API with difunto 1 (should use the new logic)
    console.log('\n3. Testing local API with difunto 1 (new logic)...');
    try {
      const localResponse = await axios.get('http://localhost:3003/api/fotos/1', { timeout: 5000 });
      console.log('✓ Difunto 1 API response:', {
        photoCount: localResponse.data.list.length,
        hasPhotos: localResponse.data.list.length > 0
      });
    } catch (localError) {
      console.log('✗ Local API failed:', localError.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testCorrectedAttachment();