import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await nocodbService.createComentario(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error creating comentario:', error);
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    );
  }
}