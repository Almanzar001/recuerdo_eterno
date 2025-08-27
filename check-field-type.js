const axios = require('axios');
const https = require('https');

const NOCODB_BASE_URL = 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const TABLE_IDS = {
  difuntos: 'm3civgj4b06c2oi'
};

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

async function checkFieldType() {
  try {
    console.log('=== CHECKING FIELD TYPE ===\n');
    
    // Get table metadata to check field type
    const tableInfo = await nocodbApi.get(`/meta/tables/${TABLE_IDS.difuntos}`);
    const fotosField = tableInfo.data.columns.find(col => 
      col.column_name === 'fotos_attachment' || col.title === 'Fotos'
    );
    
    if (fotosField) {
      console.log('Field details:', {
        name: fotosField.column_name,
        title: fotosField.title,
        type: fotosField.uidt,
        dataType: fotosField.dt
      });
      
      if (fotosField.uidt === 'Attachment') {
        console.log('\n⚠️ Field is Attachment type - need to change to LongText');
        
        // Try to update field to LongText
        try {
          const updateResponse = await nocodbApi.patch(
            `/meta/tables/${TABLE_IDS.difuntos}/columns/${fotosField.id}`,
            {
              uidt: 'LongText',
              dtxp: null,
              dtxs: null
            }
          );
          console.log('✓ Field updated to LongText:', updateResponse.data);
        } catch (updateError) {
          console.error('✗ Field update failed:', updateError.response?.data || updateError.message);
        }
        
      } else {
        console.log('✓ Field type is compatible:', fotosField.uidt);
      }
    } else {
      console.log('✗ Fotos field not found');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkFieldType();