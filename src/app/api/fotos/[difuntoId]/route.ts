import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { difuntoId: string } }
) {
  try {
    const data = await nocodbService.getFotosByDifunto(params.difuntoId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error getting fotos:', error);
    return NextResponse.json(
      { error: 'Error al obtener fotos' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { difuntoId: string } }
) {
  try {
    const formData = await request.formData();
    const uploadedPhotos = [];
    
    console.log('Uploading photos for difunto ID:', params.difuntoId);
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo-') && value instanceof File) {
        console.log('Processing file:', key, 'Size:', value.size);
        
        // Check if file is empty
        if (value.size === 0) {
          console.warn('Skipping empty file:', key);
          continue;
        }
        
        const buffer = Buffer.from(await value.arrayBuffer());
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${value.type};base64,${base64}`;
        
        const photoData = {
          URL: dataUrl,
          'Descripción': `Foto ${uploadedPhotos.length + 1}`,
          'Orden': uploadedPhotos.length + 1
        };
        
        console.log('Creating photo with data:', { ...photoData, URL: 'data:...(truncated)' });
        
        const createdPhoto = await nocodbService.createFoto(photoData, params.difuntoId);
        uploadedPhotos.push(createdPhoto);
        
        console.log('Photo created successfully:', createdPhoto.ID);
        
        // Try to create link but don't fail if it doesn't work
        if (createdPhoto.ID) {
          try {
            await nocodbService.linkFotoToDifunto(params.difuntoId, createdPhoto.ID.toString());
            console.log('Link created between difunto and foto');
          } catch (linkError) {
            console.log('Link creation failed, photos will be found by association:', linkError.message);
            // Don't throw error - photos will still be found by our hybrid search
          }
        }
      }
    }
    
    console.log(`Successfully uploaded ${uploadedPhotos.length} photos`);
    
    return NextResponse.json({ 
      message: `${uploadedPhotos.length} fotos subidas exitosamente`,
      photos: uploadedPhotos,
      difuntoId: params.difuntoId
    });
  } catch (error) {
    console.error('API Error uploading fotos:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: 'Error al subir fotos',
        details: error.message,
        difuntoId: params.difuntoId
      },
      { status: 500 }
    );
  }
}