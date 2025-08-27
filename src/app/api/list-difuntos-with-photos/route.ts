import { NextResponse } from 'next/server';
import { nocodbService } from '../../../../lib/nocodb';

export async function GET() {
  try {
    const difuntosData = await nocodbService.getDifuntos();
    const difuntos = difuntosData.list || [];
    
    console.log('=== CHECKING ALL DIFUNTOS FOR PHOTOS ===');
    
    const difuntosWithPhotos = difuntos.map(difunto => {
      const hasPrincipal = !!(difunto.foto_principal && difunto.foto_principal.length > 0);
      const hasBanner = !!(difunto.fotobanner && difunto.fotobanner.length > 0);
      const hasGallery = !!(difunto.fotos_json && difunto.fotos_json.length > 0);
      
      console.log(`ID ${difunto.ID}: Principal=${hasPrincipal}, Banner=${hasBanner}, Gallery=${hasGallery}`);
      
      return {
        ID: difunto.ID,
        Nombre: difunto.Nombre || difunto.nombre,
        hasFotoPrincipal: hasPrincipal,
        hasFotobanner: hasBanner,
        hasGallery: hasGallery,
        totalPhotos: (hasPrincipal ? 1 : 0) + (hasBanner ? 1 : 0) + (difunto.fotos_json?.length || 0)
      };
    });
    
    console.log('=== END CHECK ===');
    
    return NextResponse.json({
      success: true,
      difuntos: difuntosWithPhotos,
      count: difuntos.length
    });
    
  } catch (error: any) {
    console.error('Error listing difuntos:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}