import { NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function GET() {
  try {
    console.log('Testing difunto creation with photos...');
    
    // Test creating a difunto with minimal photo data
    const testDifuntoData = {
      Nombre: 'Test Photo Difunto ' + Date.now(),
      'Fecha Nacimiento': '1980-01-01',
      'Fecha Fallecimiento': '2020-01-01',
      Historia: 'Test historia',
      'Foto Principal': JSON.stringify({
        id: 'test_photo_' + Date.now(),
        title: 'Test Photo',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        size: 100,
        type: 'principal'
      })
    };
    
    console.log('Attempting to create difunto with photo data...');
    const result = await nocodbService.createDifunto(testDifuntoData);
    console.log('Test difunto with photo created:', result.ID || result.id);
    
    return NextResponse.json({
      success: true,
      message: 'Photo test passed',
      testDifuntoId: result.ID || result.id
    });
    
  } catch (error: unknown) {
    console.error('Photo creation test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}