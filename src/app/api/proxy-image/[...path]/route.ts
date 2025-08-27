import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

// Agent to ignore SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    const nocodbUrl = `${process.env.NOCODB_BASE_URL || 'https://ssnocodbss.coman2uniformes.com'}/${imagePath}`;
    
    console.log('=== PROXY IMAGE REQUEST ===');
    console.log('Raw path params:', params.path);
    console.log('Joined image path:', imagePath);
    console.log('Final NocoDB URL:', nocodbUrl);
    console.log('Token being used:', process.env.NOCODB_TOKEN ? 'present' : 'using fallback');
    console.log('=== STARTING REQUEST ===');
    
    // Use axios with custom agent for better SSL handling
    const response = await axios.get(nocodbUrl, {
      headers: {
        'xc-token': process.env.NOCODB_TOKEN || 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N'
      },
      httpsAgent: httpsAgent,
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    if (response.status !== 200) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    console.log('Image fetched successfully, size:', response.data.byteLength);
    
    // Get the image data
    const imageBuffer = response.data;
    const contentType = response.headers['content-type'] || 'image/webp';
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    console.error('=== PROXY ERROR ===');
    console.error('Error proxying image:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error config:', {
      url: error.config?.url,
      headers: error.config?.headers
    });
    console.error('=== END PROXY ERROR ===');
    
    return new NextResponse(`Error fetching image: ${error.message}`, { status: 500 });
  }
}