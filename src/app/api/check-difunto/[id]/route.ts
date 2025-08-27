import { NextRequest, NextResponse } from 'next/server';
import { nocodbService } from '../../../../../lib/nocodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const difuntoData = await nocodbService.getDifuntoById(params.id);
    
    console.log('=== DIFUNTO CHECK ===');
    console.log('Full difunto data:', JSON.stringify(difuntoData, null, 2));
    console.log('foto_principal type:', typeof difuntoData?.foto_principal);
    console.log('foto_principal value:', difuntoData?.foto_principal);
    console.log('fotobanner type:', typeof difuntoData?.fotobanner);  
    console.log('fotobanner value:', difuntoData?.fotobanner);
    console.log('=== END CHECK ===');
    
    return NextResponse.json({
      success: true,
      hasProfilePhoto: !!difuntoData?.foto_principal,
      hasBannerPhoto: !!difuntoData?.fotobanner,
      profilePhotoType: typeof difuntoData?.foto_principal,
      bannerPhotoType: typeof difuntoData?.fotobanner,
      profilePhotoLength: difuntoData?.foto_principal?.length || 0,
      bannerPhotoLength: difuntoData?.fotobanner?.length || 0
    });
    
  } catch (error: any) {
    console.error('Error checking difunto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}