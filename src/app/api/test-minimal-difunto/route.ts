import { NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function POST(request: Request) {
  try {
    console.log('Testing minimal difunto creation...');
    
    const data = await request.json();
    
    // Test creating with minimal data first
    const minimalData = {
      Nombre: 'Test Minimal ' + Date.now(),
      'Fecha Nacimiento': '1980-01-01',
      'Fecha Fallecimiento': '2020-01-01',
      Historia: 'Test historia minimal'
    };
    
    console.log('Creating minimal difunto...');
    const result = await nocodbService.createDifunto(minimalData);
    console.log('Minimal difunto created:', result.ID || result.id);
    
    // Test with client link
    if (data.clienteId) {
      const dataWithClient = {
        ...minimalData,
        Nombre: 'Test With Client ' + Date.now(),
        'Cliente ID': data.clienteId
      };
      
      console.log('Creating difunto with client link...');
      const resultWithClient = await nocodbService.createDifunto(dataWithClient);
      console.log('Difunto with client created:', resultWithClient.ID || resultWithClient.id);
    }
    
    return NextResponse.json({
      success: true,
      minimalId: result.ID || result.id,
      message: 'Minimal tests passed'
    });
    
  } catch (error: any) {
    console.error('Minimal test failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status
    }, { status: 500 });
  }
}