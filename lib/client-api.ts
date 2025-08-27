// Client-side API service that calls our internal Next.js API routes
import { Difunto, Cliente, Foto, Comentario } from './nocodb';

// Base URL for internal API calls
const API_BASE = '/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

export const clientApiService = {
  // Difuntos
  getDifuntos: async () => {
    return apiCall<{ list: Difunto[] }>('/difuntos');
  },

  getDifuntoById: async (id: string) => {
    return apiCall<Difunto>(`/difuntos/${id}`);
  },

  createDifunto: async (data: Partial<Difunto>) => {
    return apiCall<Difunto>('/difuntos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createDifuntoWithPhotos: async (data: Partial<Difunto>, photos: File[]) => {
    const formData = new FormData();
    
    // Add difunto data as JSON
    formData.append('difuntoData', JSON.stringify(data));
    
    // Add photos
    photos.forEach((photo, index) => {
      formData.append(`photo-${index}`, photo);
    });
    
    const response = await fetch(`${API_BASE}/difuntos/with-photos`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json();
  },

  updateDifunto: async (id: string, data: Partial<Difunto>) => {
    return apiCall<Difunto>(`/difuntos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteDifunto: async (id: string) => {
    return apiCall<{ success: boolean }>(`/difuntos/${id}`, {
      method: 'DELETE',
    });
  },

  // Clientes
  getClientes: async () => {
    return apiCall<{ list: Cliente[] }>('/clientes');
  },

  createCliente: async (data: Partial<Cliente>) => {
    return apiCall<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Fotos
  getFotosByDifunto: async (difuntoId: string) => {
    return apiCall<{ list: Foto[] }>(`/fotos/${difuntoId}`);
  },

  // Comentarios
  getComentariosByDifunto: async (difuntoId: string) => {
    return apiCall<{ list: Comentario[] }>(`/comentarios/${difuntoId}`);
  },

  createComentario: async (data: Partial<Comentario>) => {
    return apiCall<Comentario>('/comentarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // QR Code generation
  generateQRCode: async (difuntoId: string, difuntoName?: string) => {
    return apiCall<{ qrCode: string; url: string; initials: string | null }>('/qr/generate', {
      method: 'POST',
      body: JSON.stringify({ difuntoId, difuntoName }),
    });
  },
};