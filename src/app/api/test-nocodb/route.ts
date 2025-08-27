import { NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function GET() {
  try {
    console.log('Testing NocoDB connection...');
    
    // Test basic connection
    const tables = await nocodbService.getTables();
    console.log('Tables retrieved successfully');
    
    // Test getting clientes to verify structure
    const clientes = await nocodbService.getClientes();
    console.log('Clientes count:', clientes.list?.length || 0);
    
    // Test getting difuntos to verify structure
    const difuntos = await nocodbService.getDifuntos();
    console.log('Difuntos count:', difuntos.list?.length || 0);
    
    // Test getting all tables to see structure
    console.log('Getting all tables...');
    const allTables = await nocodbService.getTables();
    console.log('Available tables:', allTables.list?.map((t: { id: string; title: string }) => ({ id: t.id, title: t.title })) || allTables);
    
    // Test creating a simple difunto without photos
    const testDifuntoData = {
      Nombre: 'Test Difunto ' + Date.now(),
      'Fecha Nacimiento': '1980-01-01',
      'Fecha Fallecimiento': '2020-01-01',
      Historia: 'Test historia'
    };
    
    console.log('Attempting to create test difunto...');
    const result = await nocodbService.createDifunto(testDifuntoData);
    console.log('Test difunto created:', result.ID || result.id);
    
    return NextResponse.json({
      success: true,
      message: 'NocoDB connection test passed',
      testDifuntoId: result.ID || result.id,
      tablesCount: tables.length,
      clientesCount: clientes.list?.length || 0,
      difuntosCount: difuntos.list?.length || 0
    });
    
  } catch (error: unknown) {
    console.error('NocoDB connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}