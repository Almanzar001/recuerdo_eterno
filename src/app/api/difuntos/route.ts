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
    const data = await nocodbService.createDifunto(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error creating difunto:', error);
    return NextResponse.json(
      { error: 'Error al crear difunto' },
      { status: 500 }
    );
  }
}