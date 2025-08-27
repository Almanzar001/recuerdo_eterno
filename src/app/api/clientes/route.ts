import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function GET() {
  try {
    const data = await nocodbService.getClientes();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error getting clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await nocodbService.createCliente(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error creating cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    );
  }
}