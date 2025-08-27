import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { difuntoId: string } }
) {
  try {
    const data = await nocodbService.getComentariosByDifunto(params.difuntoId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error getting comentarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener comentarios' },
      { status: 500 }
    );
  }
}