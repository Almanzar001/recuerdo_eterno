import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Simple difunto creation API called ===');
    
    const body = await request.json();
    
    console.log('Received data:', {
      nombre: body.Nombre,
      clienteId: body['Cliente ID'],
      keys: Object.keys(body)
    });
    
    // Create a simple difunto without photos first
    const simpleDifuntoData = {
      'Cliente ID': body['Cliente ID'],
      Nombre: body.Nombre,
      'Fecha Nacimiento': body['Fecha Nacimiento'],
      'Fecha Fallecimiento': body['Fecha Fallecimiento'],
      Historia: body.Historia,
      'Video YouTube': body['Video YouTube'],
      'Ubicación': body['Ubicación']
      // Exclude photo fields for now
    };
    
    console.log('Creating simple difunto:', simpleDifuntoData);
    
    const createdDifunto = await nocodbService.createDifunto(simpleDifuntoData);
    
    console.log('Simple difunto created successfully:', createdDifunto.ID || createdDifunto.id);
    
    return NextResponse.json({
      ...createdDifunto,
      message: 'Difunto simple creado exitosamente'
    });
    
  } catch (error) {
    console.error('=== Simple API Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error response:', error.response?.data);
    
    return NextResponse.json(
      { 
        error: 'Error al crear difunto simple',
        details: error.message,
        nocodb_error: error.response?.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}