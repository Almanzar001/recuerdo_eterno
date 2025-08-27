import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await nocodbService.getDifuntoById(id);
    if (!data) {
      return NextResponse.json(
        { error: 'Difunto no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error getting difunto:', error);
    return NextResponse.json(
      { error: 'Error al obtener difunto' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await nocodbService.updateDifunto(id, body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error updating difunto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar difunto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await nocodbService.deleteDifunto(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error deleting difunto:', error);
    // Si el error tiene mensaje, mostrarlo
    return NextResponse.json(
      { error: error.message || 'Error al eliminar difunto' },
      { status: 500 }
    );
  }
}