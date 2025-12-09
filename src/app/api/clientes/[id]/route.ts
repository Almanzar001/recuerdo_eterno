import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = await nocodbService.updateCliente(params.id, body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error updating cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await nocodbService.deleteCliente(params.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error deleting cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar cliente' },
      { status: 500 }
    );
  }
}