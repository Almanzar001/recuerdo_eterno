import { NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function GET() {
  try {
    // Get tables info
    const tables = await nocodbService.getTables();
    
    // Try to get a sample difunto to see its structure
    const difuntos = await nocodbService.getDifuntos();
    const sampleDifunto = difuntos.list?.[0];
    
    // Try to get sample photos to see structure
    const fotos = await nocodbService.getFotosByDifunto('1');
    
    return NextResponse.json({
      tables,
      sampleDifunto,
      sampleFotos: fotos,
      message: 'Debug info for NocoDB structure'
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}