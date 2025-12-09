import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

// Function to extract initials from a full name
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('');
}

export async function POST(request: NextRequest) {
  try {
    const { difuntoId, difuntoName } = await request.json();
    
    if (!difuntoId) {
      return NextResponse.json(
        { error: 'ID del difunto es requerido' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://recuerdoeterno.fu-app.com';
    const url = `${baseUrl}/difunto/${difuntoId}`;
    
    // Generate QR code with high error correction to allow for custom overlay
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'H', // High error correction allows for logo overlay
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return NextResponse.json({ 
      qrCode: qrCodeDataURL,
      url: url,
      initials: difuntoName ? getInitials(difuntoName) : null
    });
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Error al generar código QR' },
      { status: 500 }
    );
  }
}