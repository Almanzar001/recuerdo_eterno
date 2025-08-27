import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function GET() {
  try {
    console.log('Testing direct NocoDB connection...');
    
    const testUrl = 'https://ssnocodbss.coman2uniformes.com/download/2025/08/27/8635d88037971cd474134650e94b0a4e464c4edd/fotobanner_SFhPS.webp';
    
    console.log('Test URL:', testUrl);
    console.log('Token:', process.env.NOCODB_TOKEN || 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N');
    
    const response = await axios.get(testUrl, {
      headers: {
        'xc-token': process.env.NOCODB_TOKEN || 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N'
      },
      httpsAgent: httpsAgent,
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Data size:', response.data.byteLength);
    
    return NextResponse.json({
      success: true,
      status: response.status,
      contentType: response.headers['content-type'],
      size: response.data.byteLength
    });
    
  } catch (error: unknown) {
    console.error('Test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}