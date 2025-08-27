// Script to add sample photos to the difunto
const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const FOTOS_TABLE_ID = 'm28pnulcjvsb2wq';

const nocodbApi = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v2`,
  headers: {
    'xc-token': NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 30000,
});

async function addSamplePhotos() {
  console.log('📸 Adding sample photos...\n');
  
  const samplePhotos = [
    {
      URL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      Descripción: 'Juan en su juventud, siempre con una sonrisa',
      Orden: 1
    },
    {
      URL: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop',
      Descripción: 'Disfrutando de un día en familia en el parque',
      Orden: 2
    },
    {
      URL: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop',
      Descripción: 'En su jardín favorito, cuidando sus plantas',
      Orden: 3
    },
    {
      URL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
      Descripción: 'Celebrando su jubilación como maestro',
      Orden: 4
    },
    {
      URL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
      Descripción: 'Momentos especiales con sus nietos',
      Orden: 5
    }
  ];

  for (let i = 0; i < samplePhotos.length; i++) {
    const photo = samplePhotos[i];
    
    try {
      console.log(`📷 Adding photo ${i + 1}: ${photo.Descripción}`);
      
      const response = await nocodbApi.post(`/tables/${FOTOS_TABLE_ID}/records`, photo);
      
      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Photo ${i + 1} added successfully`);
      }
      
    } catch (error) {
      console.error(`❌ Error adding photo ${i + 1}:`, error.response?.data?.msg || error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 Sample photos added successfully!');
  console.log('📍 Go to: http://localhost:3000/difunto/1 to see the gallery');
}

addSamplePhotos();