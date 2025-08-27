import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

// Function to extract initials from a full name
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('');
}

// Function to create QR code with initials overlay
async function createQRWithInitials(url: string, initials: string): Promise<string> {
  // Generate base QR code
  const qrCodeDataURL = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  try {
    // Create canvas to overlay initials
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    // Load the QR code image
    const qrImage = await loadImage(qrCodeDataURL);
    
    // Draw the QR code
    ctx.drawImage(qrImage, 0, 0, 512, 512);

    // Calculate center position and circle size
    const centerX = 256;
    const centerY = 256;
    const circleRadius = 45;

    // Draw white background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Draw black border around circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Set text properties
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adjust font size based on initials length
    const fontSize = initials.length <= 3 ? 24 : 18;
    ctx.font = `bold ${fontSize}px Arial`;

    // Draw the initials
    ctx.fillText(initials, centerX, centerY);

    // Convert canvas to data URL
    const finalDataURL = canvas.toDataURL('image/png');
    return finalDataURL;
  } catch (error) {
    throw new Error(`Failed to create QR with initials: ${error}`);
  }
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

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/difunto/${difuntoId}`;
    
    let qrCodeDataURL: string;

    if (difuntoName) {
      // Generate QR with initials
      const initials = getInitials(difuntoName);
      qrCodeDataURL = await createQRWithInitials(url, initials);
    } else {
      // Generate standard QR if no name provided
      qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
    
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