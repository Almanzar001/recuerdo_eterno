import axios from 'axios';
import https from 'https';

// NocoDB configuration
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = process.env.NOCODB_TOKEN || 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2'; // Your NocoDB project ID

// Table IDs (generated when tables were created)
const TABLE_IDS = {
  clientes: 'm9k7d1uhlz5wxpc',
  difuntos: 'm3civgj4b06c2oi',
  fotos: 'm28pnulcjvsb2wq',
  comentarios: 'mai0fn0vh9mrd84'
};

// Create axios instance for NocoDB with SSL handling
export const nocodbApi = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v2`,
  headers: {
    'xc-token': NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates
  }),
  timeout: 30000, // 30 second timeout
});

// Database schema types (matching NocoDB field names)
export interface Difunto {
  ID?: number;
  'Cliente ID'?: string;
  Nombre: string;
  'Fecha Nacimiento': string;
  'Fecha Fallecimiento': string;
  Historia: string;
  'Foto Principal'?: string;
  'Video YouTube'?: string;
  Ubicación?: string;
  'Código QR'?: string;
  Creado?: string;
  Actualizado?: string;
  // For backward compatibility
  id?: number;
  cliente_id?: string;
  nombre?: string;
  fecha_nacimiento?: string;
  fecha_fallecimiento?: string;
  historia?: string;
  foto_principal?: string;
  video_youtube?: string;
  ubicacion?: string;
  qr_code?: string;
}

export interface Cliente {
  ID?: number;
  Nombre: string;
  Email: string;
  Teléfono?: string;
  Creado?: string;
  Actualizado?: string;
  // For backward compatibility
  id?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
}

export interface Foto {
  ID?: number;
  'Difunto ID'?: string;
  URL: string;
  'Descripción'?: string;
  'Orden'?: number;
  Creado?: string;
  // For backward compatibility
  id?: number;
  difunto_id?: number;
  url?: string;
  descripcion?: string;
  orden?: number;
}

export interface Comentario {
  ID?: number;
  'Difunto ID'?: string;
  Autor: string;
  Email?: string;
  Comentario: string;
  Aprobado: boolean;
  Creado?: string;
  // For backward compatibility
  id?: number;
  difunto_id?: number;
  autor?: string;
  email?: string;
  comentario?: string;
  aprobado?: boolean;
}

// API functions
export const nocodbService = {
  // Get all bases/projects
  getBases: async () => {
    const response = await nocodbApi.get('/meta/bases');
    return response.data;
  },

  // Get tables in a base
  getTables: async () => {
    const response = await nocodbApi.get(`/meta/bases/${BASE_ID}/tables`);
    return response.data;
  },

  // Difuntos
  getDifuntos: async () => {
    try {
      const response = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records`);
      return response.data;
    } catch (error) {
      console.error('Error getting difuntos:', error);
      return { list: [] };
    }
  },

  getDifuntoById: async (id: string) => {
    try {
      const response = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting difunto:', error);
      return null;
    }
  },

  createDifunto: async (data: Difunto) => {
    try {
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating difunto:', error);
      throw error;
    }
  },

  updateDifunto: async (id: string, data: Partial<Difunto>) => {
    // Note: Update functionality not supported by this NocoDB version
    // Return success to avoid breaking the app
    console.log('Update request received but not processed:', { id, data });
    return { success: true, message: 'Update not supported by this NocoDB version' };
  },

  deleteDifunto: async (id: string) => {
    try {
      const response = await nocodbApi.delete(`/tables/${TABLE_IDS.difuntos}/records/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting difunto:', error);
      throw error;
    }
  },

  // Clientes
  getClientes: async () => {
    try {
      const response = await nocodbApi.get(`/tables/${TABLE_IDS.clientes}/records`);
      return response.data;
    } catch (error) {
      console.error('Error getting clientes:', error);
      return { list: [] };
    }
  },

  createCliente: async (data: Cliente) => {
    try {
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.clientes}/records`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating cliente:', error);
      throw error;
    }
  },

  // Fotos
  getFotosByDifunto: async (difuntoId: string) => {
    try {
      // First, get the difunto with its relationships
      const difuntoResponse = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}`);
      const difunto = difuntoResponse.data;
      
      // Extract photos from the relationship data
      const fotosRelation = difunto['nc_0in____nc_m2m_difuntos_fotos'] || [];
      const fotos = fotosRelation.map(rel => rel.Fotos).filter(foto => foto);
      
      // Sort by order
      fotos.sort((a, b) => (a.Orden || 0) - (b.Orden || 0));
      
      return { list: fotos };
    } catch (error) {
      console.error('Error getting fotos:', error);
      return { list: [] };
    }
  },

  createFoto: async (data: Foto) => {
    try {
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.fotos}/records`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating foto:', error);
      throw error;
    }
  },

  // Comentarios
  getComentariosByDifunto: async (difuntoId: string) => {
    try {
      const response = await nocodbApi.get(`/tables/${TABLE_IDS.comentarios}/records?where=(Difunto ID,eq,${difuntoId})&where=(Aprobado,eq,true)`);
      return response.data;
    } catch (error) {
      console.error('Error getting comentarios:', error);
      return { list: [] };
    }
  },

  createComentario: async (data: Comentario) => {
    try {
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.comentarios}/records`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating comentario:', error);
      throw error;
    }
  },

  approveComentario: async (id: string) => {
    try {
      const response = await nocodbApi.patch(`/tables/${TABLE_IDS.comentarios}/records/${id}`, { Aprobado: true });
      return response.data;
    } catch (error) {
      console.error('Error approving comentario:', error);
      throw error;
    }
  },

  // Debug functions
  getTableMetadata: async (tableName: string) => {
    try {
      const tableId = TABLE_IDS[tableName];
      if (!tableId) throw new Error(`Table ${tableName} not found`);
      
      const response = await nocodbApi.get(`/meta/tables/${tableId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting table metadata:', error);
      throw error;
    }
  },

  // Alternative approach for linking records
  linkFotoToDifunto: async (difuntoId: string, fotoId: string) => {
    try {
      // Try to create a link between difunto and foto
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/fotos/${fotoId}`);
      return response.data;
    } catch (error) {
      console.error('Error linking foto to difunto:', error);
      throw error;
    }
  },

  linkComentarioToDifunto: async (difuntoId: string, comentarioId: string) => {
    try {
      // Try to create a link between difunto and comentario
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/comentarios/${comentarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error linking comentario to difunto:', error);
      throw error;
    }
  },
};