const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

async function testEndpointDirect() {
  try {
    console.log('=== TESTING ENDPOINT DIRECTLY ===\n');
    
    // Test the with-photos endpoint with actual data
    const formData = new FormData();
    
    const difuntoData = {
      'Cliente ID': '1',
      Nombre: 'Test Direct',
      'Fecha Nacimiento': '1990-01-01',
      'Fecha Fallecimiento': '2024-01-01',
      Historia: 'Testing direct endpoint'
    };
    
    formData.append('difuntoData', JSON.stringify(difuntoData));
    
    // Create a small test image buffer
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('photo-0', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log('Making request to with-photos endpoint...');
    
    const response = await axios.post('http://localhost:3003/api/difuntos/with-photos', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✓ Success:', response.data);
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEndpointDirect();