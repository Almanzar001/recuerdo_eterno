import axios from 'axios';
import https from 'https';

// NocoDB configuration
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://ssnocodbss.coman2uniformes.com';
const NOCODB_TOKEN = process.env.NOCODB_TOKEN || 'aJjkcJUqJDlltpOI6J7QLLnW1HaRkMscERQJso-N';
const BASE_ID = 'py0878vkmblvxv2';

// Table IDs (generated when tables were created)
const TABLE_IDS = {
  clientes: 'm9k7d1uhlz5wxpc',
  difuntos: 'm3civgj4b06c2oi'
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

// Database schema types (matching actual NocoDB field names)
export interface Difunto {
  ID?: number;
  Clientes?: number; // Link to cliente
  nombre: string;
  fecha_nacimiento: string;
  fecha_fallecimiento: string;
  historia: string;
  foto_principal?: string;
  fotobanner?: string; // Banner photo
  video_youtube?: string;
  ubicacion?: string;
  qr_code?: string;
  fotos_json?: string; // JSON string with photo data
  created_at?: string;
  updated_at?: string;
  // For form compatibility
  'Cliente ID'?: string;
  Nombre?: string;
  'Fecha Nacimiento'?: string;
  'Fecha Fallecimiento'?: string;
  Historia?: string;
  'Foto Principal'?: string;
  fotobanner?: string;
  'Video YouTube'?: string;
  Ubicación?: string;
  'Fotos'?: any[];
  id?: number;
}

export interface Cliente {
  ID?: number;
  nombre: string;
  email: string;
  telefono?: string;
  created_at?: string;
  updated_at?: string;
  // For form compatibility
  Nombre?: string;
  Email?: string;
  Teléfono?: string;
  id?: number;
}

export interface Foto {
  ID?: number;
  Difuntos?: number; // Link to difunto via many-to-many
  url: string;
  descripcion?: string;
  orden?: number;
  created_at?: string;
  // For form compatibility
  URL?: string;
  'Descripción'?: string;
  'Orden'?: number;
  id?: number;
}

export interface Comentario {
  ID?: number;
  Fotos?: number; // Link to foto - comments are linked to photos, not difuntos
  autor: string;
  email?: string;
  comentario: string;
  aprobado: boolean;
  created_at?: string;
  // For form compatibility  
  Autor?: string;
  Email?: string;
  Comentario?: string;
  Aprobado?: boolean;
  id?: number;
}

// Helper functions for attachment upload
const uploadPhotoAsAttachment = async (difuntoId: string, fieldName: string, photoData: string) => {
  try {
    // Parse JSON photo data
    const photoObj = JSON.parse(photoData);
    
    // Convert base64 back to Buffer
    const base64Data = photoObj.url.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create FormData for attachment upload (Node.js version)
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Append buffer as file with proper metadata
    formData.append('file', buffer, {
      filename: `${fieldName}.webp`,
      contentType: 'image/webp'
    });
    
    // First upload file to get signed URL
    const uploadResponse = await nocodbApi.post(
      `/storage/upload`,
      formData,
      {
        headers: {
          'xc-token': NOCODB_TOKEN,
          ...formData.getHeaders()
        }
      }
    );
    
    // Then update the record with the uploaded file reference
    console.log(`Updating difunto ${difuntoId} with ${fieldName}:`, uploadResponse.data);
    const updateResponse = await nocodbApi.patch(
      `/tables/${TABLE_IDS.difuntos}/records`,
      [{
        ID: parseInt(difuntoId),
        [fieldName]: [uploadResponse.data[0]]  // Ensure it's an array
      }],
      {
        headers: {
          'Content-Type': 'application/json',
          'xc-token': NOCODB_TOKEN
        }
      }
    );
    
    return uploadResponse.data;
  } catch (error) {
    console.error(`Error uploading ${fieldName}:`, error);
    throw error;
  }
};

const uploadGalleryPhotosAsAttachments = async (difuntoId: string, photos: File[]) => {
  try {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      // Convert File to Buffer
      const buffer = Buffer.from(await photo.arrayBuffer());
      
      // Create FormData for attachment upload (Node.js version)
      const FormData = require('form-data');
      const formData = new FormData();
      
      formData.append('file', buffer, {
        filename: photo.name,
        contentType: photo.type
      });
      
      // Upload file to storage first
      const uploadResponse = await nocodbApi.post(
        `/storage/upload`,
        formData,
        {
          headers: {
            'xc-token': NOCODB_TOKEN,
            ...formData.getHeaders()
          }
        }
      );
      
      // Get current record to append to existing attachments
      const currentRecord = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}`);
      const existingAttachments = currentRecord.data.fotos_json || [];
      
      // Update record with new attachment
      await nocodbApi.patch(
        `/tables/${TABLE_IDS.difuntos}/records`,
        [{
          ID: parseInt(difuntoId),
          fotos_json: [...existingAttachments, uploadResponse.data[0]]
        }],
        {
          headers: {
            'Content-Type': 'application/json',
            'xc-token': NOCODB_TOKEN
          }
        }
      );
    }
  } catch (error) {
    console.error('Error uploading gallery photos:', error);
    throw error;
  }
};

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
      // Filtrar registros marcados como eliminados
      const filteredList = response.data.list?.filter((difunto: any) => 
        !difunto.Nombre?.startsWith('[ELIMINADO]')
      ) || [];
      
      return { ...response.data, list: filteredList };
    } catch (error) {
      console.error('Error getting difuntos:', error);
      return { list: [] };
    }
  },

  getDifuntoById: async (id: string) => {
    try {
      const response = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${id}`);
      const difunto = response.data;
      
      // Si el registro está marcado como eliminado, retornar null
      if (difunto.Nombre?.startsWith('[ELIMINADO]')) {
        return null;
      }
      
      return difunto;
    } catch (error) {
      console.error('Error getting difunto:', error);
      return null;
    }
  },

  createDifunto: async (data: Partial<Difunto>, photos?: File[]) => {
    try {
      // Map form data to database schema - without photo data initially
      const dbData = {
        nombre: data.Nombre || data.nombre,
        fecha_nacimiento: data['Fecha Nacimiento'] || data.fecha_nacimiento,
        fecha_fallecimiento: data['Fecha Fallecimiento'] || data.fecha_fallecimiento,
        historia: data.Historia || data.historia,
        video_youtube: data['Video YouTube'] || data.video_youtube,
        ubicacion: data['Ubicación'] || data.ubicacion,
        Cliente: data['Cliente ID'] ? [parseInt(data['Cliente ID'])] : undefined
      };

      console.log('Valor de Cliente para vinculación:', dbData.Cliente);

      // Create difunto record first without photos
      const response = await nocodbApi.post(
        `/tables/${TABLE_IDS.difuntos}/records`,
        dbData,
        {
          headers: {
            'Content-Type': 'application/json',
            'xc-token': NOCODB_TOKEN
          }
        }
      );
      
      const createdDifunto = response.data;
      const difuntoId = createdDifunto.ID || createdDifunto.id;

      // Now upload photos as attachments if any
      if (data['Foto Principal']) {
        await uploadPhotoAsAttachment(difuntoId, 'foto_principal', data['Foto Principal']);
      }

      if (data.fotobanner) {
        await uploadPhotoAsAttachment(difuntoId, 'fotobanner', data.fotobanner);
      }

      if (photos && photos.length > 0) {
        await uploadGalleryPhotosAsAttachments(difuntoId, photos);
      }
      
      return createdDifunto;
    } catch (error) {
      console.error('Error creating difunto:', error);
      throw error;
    }
  },

  updateDifunto: async (id: string, data: Partial<Difunto>) => {
    try {
      // Map form data to database schema
      const dbData = {
        nombre: data.Nombre || data.nombre,
        fecha_nacimiento: data['Fecha Nacimiento'] || data.fecha_nacimiento,
        fecha_fallecimiento: data['Fecha Fallecimiento'] || data.fecha_fallecimiento,
        historia: data.Historia || data.historia,
        foto_principal: data['Foto Principal'] || data.foto_principal,
        fotobanner: data.fotobanner,
        video_youtube: data['Video YouTube'] || data.video_youtube,
        ubicacion: data['Ubicación'] || data.ubicacion,
        Clientes: data['Cliente ID'] ? parseInt(data['Cliente ID']) : undefined
      };

      const response = await nocodbApi.patch(`/tables/${TABLE_IDS.difuntos}/records/${id}`, dbData);
      return response.data;
    } catch (error) {
      console.error('Error updating difunto:', error);
      throw error;
    }
  },

  deleteDifunto: async (id: string) => {
    try {
      // 1. Verificar que el registro existe
      try {
        const existingRecord = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${id}`);
      } catch (checkError: any) {
        if (checkError.response?.status === 404) {
          throw new Error(`El difunto con ID ${id} no existe o ya fue eliminado.`);
        }
        throw checkError;
      }

      // 2. Implementar eliminación suave usando bulk PATCH
      const response = await nocodbApi.patch(`/tables/${TABLE_IDS.difuntos}/records`, [
        {
          ID: parseInt(id),
          Nombre: '[ELIMINADO] - ' + (new Date().toISOString().split('T')[0]),
          Historia: '[REGISTRO ELIMINADO]'
        }
      ]);
      
      return { success: true, deleted: id, soft_delete: true };
    } catch (error: any) {
      console.error('Error eliminando difunto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`No se pudo eliminar el difunto: ${errorMessage}`);
    }
  },

  // Función para restaurar un difunto eliminado (por si acaso)
  restoreDifunto: async (id: string, originalData?: any) => {
    try {
      
      const response = await nocodbApi.patch(`/tables/${TABLE_IDS.difuntos}/records`, [
        {
          ID: parseInt(id),
          Nombre: originalData?.Nombre || 'Registro Restaurado',
          Historia: originalData?.Historia || 'Registro restaurado desde eliminación suave'
        }
      ]);
      
      console.log('Difunto restaurado exitosamente');
      return { success: true, restored: id };
    } catch (error: any) {
      console.error('Error restaurando difunto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`No se pudo restaurar el difunto: ${errorMessage}`);
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

  createCliente: async (data: Partial<Cliente>) => {
    try {
      const dbData = {
        nombre: data.Nombre || data.nombre,
        email: data.Email || data.email,
        telefono: data['Teléfono'] || data.telefono
      };
      
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.clientes}/records`, dbData);
      return response.data;
    } catch (error) {
      console.error('Error creating cliente:', error);
      throw error;
    }
  },

  // Fotos - New attachment-based approach
  getFotosByDifunto: async (difuntoId: string) => {
    try {
      // Get difunto record with attachment fields
      const difuntoResponse = await nocodbApi.get(`/tables/${TABLE_IDS.difuntos}/records/${difuntoId}`);
      const difunto = difuntoResponse.data;
      
      console.log('=== DEBUGGING DIFUNTO PHOTO DATA ===');
      console.log('Difunto data keys:', Object.keys(difunto));
      console.log('foto_principal type:', typeof difunto.foto_principal, 'value:', difunto.foto_principal);
      console.log('fotobanner type:', typeof difunto.fotobanner, 'value:', difunto.fotobanner);
      console.log('fotos_json type:', typeof difunto.fotos_json, 'value:', difunto.fotos_json);
      console.log('=== END DEBUG ===');
      
      // Collect all photos
      const allPhotos = [];
      
      // Add foto principal if exists
      if (difunto.foto_principal && difunto.foto_principal.length > 0) {
        const fotoPrincipal = difunto.foto_principal[0];
        allPhotos.push({
          ID: `principal_${difuntoId}`,
          url: fotoPrincipal.signedUrl || fotoPrincipal.url || `/api/proxy-image/${fotoPrincipal.path}`,
          descripcion: 'Foto Principal',
          orden: 0,
          tipo: 'principal',
          created_at: new Date().toISOString()
        });
      }
      
      // Add fotobanner if exists
      if (difunto.fotobanner && difunto.fotobanner.length > 0) {
        const fotoBanner = difunto.fotobanner[0];
        allPhotos.push({
          ID: `banner_${difuntoId}`,
          url: fotoBanner.signedUrl || fotoBanner.url || `/api/proxy-image/${fotoBanner.path}`,
          descripcion: 'Foto Banner',
          orden: 1,
          tipo: 'banner',
          created_at: new Date().toISOString()
        });
      }
      
      // Add gallery photos if exist
      if (difunto.fotos_json && difunto.fotos_json.length > 0) {
        difunto.fotos_json.forEach((foto, index) => {
          allPhotos.push({
            ID: `gallery_${difuntoId}_${index}`,
            url: foto.signedUrl || foto.url || `/api/proxy-image/${foto.path}`,
            descripcion: foto.title || `Foto ${index + 1}`,
            orden: index + 2,
            tipo: 'gallery',
            created_at: new Date().toISOString()
          });
        });
      }
      
      console.log(`Found ${allPhotos.length} photos total (${difunto.foto_principal?.length || 0} principal, ${difunto.fotobanner?.length || 0} banner, ${difunto.fotos_json?.length || 0} gallery)`);
      
      return { list: allPhotos };
    } catch (error) {
      console.error('Error getting fotos from attachments:', error);
      return { list: [] };
    }
  },

  createFoto: async (data: Partial<Foto>, difuntoId?: string) => {
    try {
      const dbData = {
        url: data.URL || data.url,
        descripcion: data['Descripción'] || data.descripcion,
        orden: data['Orden'] || data.orden,
        // Set Difuntos field during creation if provided
        ...(difuntoId && { Difuntos: parseInt(difuntoId) })
      };
      
      console.log('Creating foto with data:', { ...dbData, url: 'data:...(truncated)' });
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.fotos}/records`, dbData);
      return response.data;
    } catch (error) {
      console.error('Error creating foto:', error);
      throw error;
    }
  },

  // Link foto to difunto using NocoDB's link API
  linkFotoToDifunto: async (difuntoId: string, fotoId: string) => {
    try {
      console.log(`Linking foto ${fotoId} to difunto ${difuntoId}`);
      
      // Use NocoDB's link API
      const linkData = [{
        Id: parseInt(fotoId)
      }];
      
      const response = await nocodbApi.post(
        `/tables/${TABLE_IDS.difuntos}/records/${difuntoId}/links/fotos`, 
        linkData
      );
      
      console.log('Photo link created successfully');
      return response.data;
    } catch (error) {
      console.error('Error linking foto to difunto:', error.response?.data || error.message);
      throw error;
    }
  },

  // Comentarios (linked to photos)
  getComentariosByDifunto: async (difuntoId: string) => {
    try {
      // Since comments are linked to photos, we need to get all photos for this difunto first
      const fotosData = await this.getFotosByDifunto(difuntoId);
      const fotos = fotosData.list || [];
      
      const allComentarios: any[] = [];
      for (const foto of fotos) {
        const comentariosRelation = foto['nc_0in____nc_m2m_fotos_comentarios'] || [];
        const comentarios = comentariosRelation.map(rel => rel.Comentarios).filter(c => c && c.aprobado);
        allComentarios.push(...comentarios);
      }
      
      return { list: allComentarios };
    } catch (error) {
      console.error('Error getting comentarios:', error);
      return { list: [] };
    }
  },

  createComentario: async (data: Partial<Comentario>) => {
    try {
      const dbData = {
        autor: data.Autor || data.autor,
        email: data.Email || data.email,
        comentario: data.Comentario || data.comentario,
        aprobado: data.Aprobado !== undefined ? data.Aprobado : data.aprobado
      };
      
      const response = await nocodbApi.post(`/tables/${TABLE_IDS.comentarios}/records`, dbData);
      return response.data;
    } catch (error) {
      console.error('Error creating comentario:', error);
      throw error;
    }
  },

  approveComentario: async (id: string) => {
    try {
      const response = await nocodbApi.patch(`/tables/${TABLE_IDS.comentarios}/records/${id}`, { aprobado: true });
      return response.data;
    } catch (error) {
      console.error('Error approving comentario:', error);
      throw error;
    }
  }
};