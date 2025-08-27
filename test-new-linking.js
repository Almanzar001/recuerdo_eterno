const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const TABLE_IDS = {
  fotos: 'm28pnulcjvsb2wq',
  difuntos: 'm3civgj4b06c2oi',
  clientes: 'm9k7d1uhlz5wxpc'
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

async function testNewLinking() {
  try {
    console.log('=== TESTING NEW LINKING APPROACH ===\n');
    
    // Step 1: Create a difunto
    console.log('1. Creating new difunto...');
    const difuntoData = {
      nombre: 'Test User 2',
      fecha_nacimiento: '1985-01-01',
      fecha_fallecimiento: '2024-01-01',
      historia: 'Another test user'
    };
    
    const difuntoResult = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records`, difuntoData);
    const difuntoId = difuntoResult.data.ID;
    console.log('Difunto created with ID:', difuntoId);
    
    // Step 2: Link to client
    console.log('\n2. Linking difunto to client...');
    try {
      // Try different formats
      let clientLinkData = [{ Id: 1 }];
      await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/Clientes`, clientLinkData);
      console.log('Client link successful');
    } catch (clientLinkError) {
      console.error('Client link failed:', clientLinkError.response?.data || clientLinkError.message);
      
      // Try alternative format
      try {
        console.log('Trying alternative client link format...');
        const altClientLinkData = [1];
        await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/Clientes`, altClientLinkData);
        console.log('Alternative client link successful');
      } catch (altError) {
        console.error('Alternative client link also failed:', altError.response?.data || altError.message);
      }
    }
    
    // Step 3: Create a photo
    console.log('\n3. Creating photo...');
    const photoData = {
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      descripcion: 'New Test Photo',
      orden: 1
    };
    
    const photoResult = await nocodbApi.post(`/tables/${TABLE_IDS.fotos}/records`, photoData);
    const photoId = photoResult.data.ID;
    console.log('Photo created with ID:', photoId);
    
    // Step 4: Link photo to difunto
    console.log('\n4. Linking photo to difunto...');
    try {
      const photoLinkData = [{ Id: photoId }];
      await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/fotos`, photoLinkData);
      console.log('Photo link successful');
    } catch (photoLinkError) {
      console.error('Photo link failed:', photoLinkError.response?.data || photoLinkError.message);
      
      // Try alternative format
      try {
        console.log('Trying alternative photo link format...');
        const altPhotoLinkData = [photoId];
        await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/fotos`, altPhotoLinkData);
        console.log('Alternative photo link successful');
      } catch (altError) {
        console.error('Alternative photo link also failed:', altError.response?.data || altError.message);
      }
    }
    
    // Step 5: Verify the links
    console.log('\n5. Verifying links...');
    
    const difuntoCheck = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}`);
    console.log('Difunto client link:', difuntoCheck.data.Clientes || 'No client linked');
    console.log('Difunto photo count:', difuntoCheck.data.fotos || 0);
    console.log('M2M relations count:', difuntoCheck.data['nc_0in____nc_m2m_difuntos_fotos']?.length || 0);
    
    if (difuntoCheck.data['nc_0in____nc_m2m_difuntos_fotos']?.length > 0) {
      console.log('First photo in relation:', difuntoCheck.data['nc_0in____nc_m2m_difuntos_fotos'][0].Fotos.ID);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testNewLinking();