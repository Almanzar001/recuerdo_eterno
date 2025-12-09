import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Difuntos with photos API called ===');
    
    const formData = await request.formData();
    
    // Get difunto data
    const difuntoDataString = formData.get('difuntoData') as string;
    if (!difuntoDataString) {
      console.error('No difunto data found in request');
      return NextResponse.json(
        { error: 'Difunto data is required' },
        { status: 400 }
      );
    }
    
    const difuntoData = JSON.parse(difuntoDataString);
    console.log('Difunto data received:', {
      nombre: difuntoData.Nombre,
      has_foto_principal: !!difuntoData['Foto Principal'],
      has_fotobanner: !!difuntoData.fotobanner,
      foto_principal_length: difuntoData['Foto Principal']?.length || 0,
      fotobanner_length: difuntoData.fotobanner?.length || 0
    });

    // Log photo sizes to check if they're too large
    if (difuntoData['Foto Principal']) {
      const principalSizeKB = (difuntoData['Foto Principal'].length * 3/4) / 1024;
      console.log(`Foto Principal size: ${principalSizeKB.toFixed(1)}KB`);
    }
    if (difuntoData.fotobanner) {
      const bannerSizeKB = (difuntoData.fotobanner.length * 3/4) / 1024;
      console.log(`Foto Banner size: ${bannerSizeKB.toFixed(1)}KB`);
    }
    
    // Get gallery photos from form data
    const photos: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo-') && value instanceof File) {
        if (value.size > 0) {
          photos.push(value);
        }
      }
    }
    
    console.log(`Found ${photos.length} gallery photos to process`);
    
    // Log the actual data being sent to NocoDB
    const mappedData = {
      nombre: difuntoData.Nombre,
      fecha_nacimiento: difuntoData['Fecha Nacimiento'],
      fecha_fallecimiento: difuntoData['Fecha Fallecimiento'],
      historia: difuntoData.Historia,
      foto_principal: difuntoData['Foto Principal'],
      fotobanner: difuntoData.fotobanner,
      video_youtube: difuntoData['Video YouTube'],
      ubicacion: difuntoData['Ubicación'],
      Cliente: difuntoData['Cliente ID'] ? [parseInt(difuntoData['Cliente ID'])] : undefined
    };
    
    console.log('Mapped data for NocoDB:', {
      ...mappedData,
      foto_principal: mappedData.foto_principal ? 'base64 data present' : 'no photo',
      fotobanner: mappedData.fotobanner ? 'base64 data present' : 'no banner',
    });
    
    // Create difunto with photos using the new method
    console.log('Attempting to create difunto in NocoDB...');
    const createdDifunto = await nocodbService.createDifunto(difuntoData, photos);
    console.log('NocoDB creation successful');
    
    console.log('Difunto created successfully with ID:', createdDifunto.ID || createdDifunto.id);
    
    return NextResponse.json({
      ...createdDifunto,
      message: `Difunto creado con ${photos.length} fotos de galería exitosamente`,
      photoCount: photos.length,
      hasFotoPrincipal: !!difuntoData['Foto Principal'],
      hasFotobanner: !!difuntoData.fotobanner
    });
    
  } catch (error: any) {
    console.error('=== API Error creating difunto with photos ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Full error object:', error);
    
    // Additional debugging
    if (error.response?.data) {
      console.error('NocoDB detailed error:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.config) {
      console.error('Request config:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear difunto con fotos',
        details: error.message,
        nocodb_error: error.response?.data,
        status_code: error.response?.status,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}