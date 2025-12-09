import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function GET() {
  try {
    const data = await nocodbService.getDifuntos();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error getting difuntos:', error);
    return NextResponse.json(
      { error: 'Error al obtener difuntos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating difunto with data:', {
      nombre: body.Nombre || body.nombre,
      clienteId: body['Cliente ID'],
      hasPhotos: !!body['Foto Principal'] || !!body.fotobanner
    });
    const data = await nocodbService.createDifunto(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error creating difunto:', error);
    console.error('Error details:', error.message);
    console.error('Error response:', error.response?.data);
    return NextResponse.json(
      { 
        error: 'Error al crear difunto',
        details: error.message,
        nocodb_error: error.response?.data
      },
      { status: 500 }
    );
  }
}