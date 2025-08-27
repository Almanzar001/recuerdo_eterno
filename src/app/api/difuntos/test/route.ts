import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Test endpoint received data:', {
      keys: Object.keys(body),
      nombre: body.Nombre,
      has_foto_principal: !!body['Foto Principal'],
      has_fotobanner: !!body.fotobanner,
      foto_principal_length: body['Foto Principal']?.length || 0,
      fotobanner_length: body.fotobanner?.length || 0
    });
    
    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      data: {
        keys: Object.keys(body),
        nombre: body.Nombre,
        has_foto_principal: !!body['Foto Principal'],
        has_fotobanner: !!body.fotobanner,
        foto_principal_length: body['Foto Principal']?.length || 0,
        fotobanner_length: body.fotobanner?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Test endpoint error',
        details: error.message
      },
      { status: 500 }
    );
  }
}