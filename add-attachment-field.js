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

async function addAttachmentField() {
  try {
    console.log('=== ADDING ATTACHMENT FIELD TO DIFUNTOS TABLE ===\n');
    
    // 1. Get current table structure
    console.log('1. Getting current table structure...');
    const tableInfo = await nocodbApi.get(`/meta/tables/${TABLE_IDS.difuntos}`);
    console.log('Current fields:', tableInfo.data.columns.length);
    
    // 2. Add attachment field
    console.log('\n2. Adding attachment field...');
    
    const newFieldData = {
      column_name: 'fotos_attachment',
      title: 'Fotos',
      uidt: 'Attachment',
      dtxp: null,
      dtxs: null,
      np: null,
      ns: null,
      clen: null,
      cop: '1',
      pk: false,
      pv: false,
      rqd: false,
      un: false,
      ct: 'varchar(255)',
      ai: false,
      unique: false,
      cdf: null,
      cc: '',
      csn: null,
      dtx: 'specificType',
      altered: 1,
      colOptions: {
        fk_model_id: TABLE_IDS.difuntos
      }
    };
    
    try {
      const addFieldResponse = await nocodbApi.post(
        `/meta/tables/${TABLE_IDS.difuntos}/columns`, 
        newFieldData
      );
      
      console.log('Attachment field added successfully!');
      console.log('Field details:', {
        id: addFieldResponse.data.id,
        title: addFieldResponse.data.title,
        type: addFieldResponse.data.uidt
      });
      
    } catch (addError) {
      console.error('Failed to add field:', addError.response?.data || addError.message);
      
      // Try alternative format
      console.log('\nTrying alternative field format...');
      
      const altFieldData = {
        column_name: 'fotos_attachment',
        title: 'Fotos Attachment',
        uidt: 'Attachment'
      };
      
      try {
        const altResponse = await nocodbApi.post(
          `/meta/tables/${TABLE_IDS.difuntos}/columns`, 
          altFieldData
        );
        console.log('Alternative format worked!', altResponse.data);
      } catch (altError) {
        console.error('Alternative format also failed:', altError.response?.data || altError.message);
      }
    }
    
    // 3. Verify the field was added
    console.log('\n3. Verifying field was added...');
    const updatedTableInfo = await nocodbApi.get(`/meta/tables/${TABLE_IDS.difuntos}`);
    const attachmentFields = updatedTableInfo.data.columns.filter(col => col.uidt === 'Attachment');
    
    console.log('Attachment fields found:', attachmentFields.length);
    attachmentFields.forEach(field => {
      console.log(`  - ${field.title} (${field.column_name})`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

addAttachmentField();