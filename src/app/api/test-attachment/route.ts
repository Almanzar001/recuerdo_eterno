import { NextRequest, NextResponse } from 'next/server';
import { nocodbApi, TABLE_IDS } from '../../../../lib/nocodb';

export async function POST(_request: NextRequest) {
  try {
    console.log('Testing attachment upload...');
    
    // First create a simple difunto record
    const testData = {
      nombre: 'Test Attachment ' + Date.now(),
      fecha_nacimiento: '1980-01-01',
      fecha_fallecimiento: '2020-01-01',
      historia: 'Test historia for attachment'
    };
    
    console.log('Creating test difunto...');
    const createResponse = await nocodbApi.post(
      `/tables/${TABLE_IDS.difuntos}/records`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'xc-token': process.env.NOCODB_TOKEN
        }
      }
    );
    
    const difuntoId = createResponse.data.ID || createResponse.data.id;
    console.log('Test difunto created with ID:', difuntoId);
    
    // Create a minimal test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(testImageBase64, 'base64');
    
    // Test form-data upload
    console.log('Testing form-data upload...');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', buffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log('Attempting storage upload...');
    const uploadResponse = await nocodbApi.post(
      `/storage/upload`,
      formData,
      {
        headers: {
          'xc-token': process.env.NOCODB_TOKEN,
          ...formData.getHeaders()
        }
      }
    );
    
    console.log('Upload response:', uploadResponse.data);
    
    return NextResponse.json({
      success: true,
      difuntoId,
      uploadResult: uploadResponse.data,
      message: 'Attachment test completed'
    });
    
  } catch (error: unknown) {
    console.error('Attachment test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
    });
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}