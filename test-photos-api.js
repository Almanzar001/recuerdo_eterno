// Test photos API functionality
const axios = require('axios');

async function testPhotosAPI() {
  try {
    console.log('🧪 Testing photos API functionality...');
    
    // Test the internal API route (if it exists)
    try {
      const response = await axios.get('http://localhost:3001/api/fotos?difuntoId=1');
      console.log('📸 Photos API response:', response.data);
    } catch (error) {
      console.log('ℹ️  Photos API route doesn\'t exist, checking page directly...');
    }
    
    // Test if the commemorative page loads
    try {
      const pageResponse = await axios.get('http://localhost:3001/difunto/1');
      console.log('✅ Commemorative page loads successfully');
      
      // Check if it contains gallery elements
      const hasGallery = pageResponse.data.includes('gallery') || pageResponse.data.includes('foto');
      console.log('🖼️  Page contains gallery elements:', hasGallery);
    } catch (error) {
      console.log('❌ Error loading commemorative page:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPhotosAPI();