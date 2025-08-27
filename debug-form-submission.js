const FormData = require('form-data');
const axios = require('axios');

async function debugFormSubmission() {
  try {
    console.log('=== DEBUGGING FORM SUBMISSION ===\n');
    
    // Simulate exact form data from the React app
    const formData = new FormData();
    
    const difuntoData = {
      'Cliente ID': '1',
      Nombre: 'Debug Test',
      'Fecha Nacimiento': '1990-01-01',
      'Fecha Fallecimiento': '2024-01-01',
      Historia: 'Testing form submission debug'
    };
    
    console.log('1. Difunto data:', difuntoData);
    formData.append('difuntoData', JSON.stringify(difuntoData));
    
    // Add a test photo
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('photo-0', testImageBuffer, {
      filename: 'test-photo.png',
      contentType: 'image/png'
    });
    
    console.log('2. Making request...');
    
    const response = await axios.post('http://localhost:3003/api/difuntos/with-photos', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 600; // Don't throw for any status < 600
      }
    });
    
    console.log('3. Response status:', response.status);
    console.log('4. Response data:', response.data);
    
    if (response.status >= 400) {
      console.log('❌ Error response details:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    } else {
      console.log('✅ Success!');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
  }
}

debugFormSubmission();