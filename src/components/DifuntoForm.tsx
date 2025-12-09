'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Trash2 } from 'lucide-react';
import { clientApiService } from '../../lib/client-api';
import { Difunto, Cliente } from '../../lib/nocodb';

const difuntoSchema = z.object({
  'Cliente ID': z.string().min(1, 'Debe seleccionar un cliente'),
  Nombre: z.string().min(1, 'El nombre es requerido'),
  'Fecha Nacimiento': z.string().min(1, 'La fecha de nacimiento es requerida'),
  'Fecha Fallecimiento': z.string().min(1, 'La fecha de fallecimiento es requerida'),
  Historia: z.string().min(1, 'La historia es requerida'),
  'Foto Principal': z.string().optional(),
  fotobanner: z.string().optional(),
  'Video YouTube': z.string().optional(),
  'Ubicación': z.string().optional(),
});

const compressImageToWebP = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable image smoothing for better quality at smaller sizes
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try WebP first (most efficient), fallback to JPEG
      canvas.toBlob((webpBlob) => {
        if (webpBlob) {
          const compressedFile = new File([webpBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          // Fallback to JPEG with higher compression
          canvas.toBlob((jpegBlob) => {
            if (jpegBlob) {
              const compressedFile = new File([jpegBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality * 0.8);
        }
      }, 'image/webp', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Convert file directly to base64 without re-compression
const fileToBase64WebP = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Legacy function - keep for backward compatibility
const compressImageToBase64 = (file: File, maxWidth: number = 500, quality: number = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Very aggressive sizing for base64
      let { width, height } = img;
      
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try WebP first for smaller base64
      canvas.toBlob((webpBlob) => {
        if (webpBlob) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(webpBlob);
        } else {
          // Fallback to JPEG with very high compression
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        }
      }, 'image/webp', quality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

type DifuntoForm = z.infer<typeof difuntoSchema>;

interface DifuntoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  difunto?: Difunto;
}

export default function DifuntoFormModal({ isOpen, onClose, onSuccess, difunto }: DifuntoFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [fotoPrincipal, setFotoPrincipal] = useState<File | null>(null);
  const [fotobanner, setFotobanner] = useState<File | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const isEditing = !!difunto;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DifuntoForm>({
    resolver: zodResolver(difuntoSchema),
    defaultValues: difunto ? {
      'Cliente ID': difunto['Cliente ID'] || '',
      Nombre: difunto.Nombre || '',
      'Fecha Nacimiento': difunto['Fecha Nacimiento'] || '',
      'Fecha Fallecimiento': difunto['Fecha Fallecimiento'] || '',
      Historia: difunto.Historia || '',
      'Foto Principal': difunto['Foto Principal'] || '',
      fotobanner: difunto.fotobanner || '',
      'Video YouTube': difunto['Video YouTube'] || '',
      'Ubicación': difunto.Ubicación || '',
    } : {}
  });

  const uploadPhotosForDifunto = async (difuntoId: string, photos: File[]) => {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photo-${index}`, photo);
    });
    
    console.log('Uploading', photos.length, 'photos for difunto:', difuntoId);
    
    const response = await fetch(`/api/fotos/${difuntoId}`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Upload response:', result);
    
    if (!response.ok) {
      throw new Error(result.details || result.error || 'Failed to upload photos');
    }
    
    return result;
  };

  // Convert image to optimized base64 for JSON storage
  const convertToOptimizedBase64 = compressImageToBase64;

  const onSubmit = async (data: DifuntoForm) => {
    try {
      setSubmitting(true);
      
      // Prepare photo data for attachment upload
      let fotoPrincipalData = data['Foto Principal'] || '';
      let fotobannerData = data.fotobanner || '';
      
      if (fotoPrincipal) {
        console.log(`Preparing foto principal for attachment: ${(fotoPrincipal.size / 1024).toFixed(1)}KB`);
        // For attachment fields, we still need to convert to JSON format for API compatibility
        const base64 = await fileToBase64WebP(fotoPrincipal);
        fotoPrincipalData = JSON.stringify({
          id: `fp_${Date.now()}`,
          title: 'Foto Principal',
          url: base64,
          size: base64.length,
          type: 'principal'
        });
        console.log(`Foto principal prepared for attachment upload`);
      }
      
      if (fotobanner) {
        console.log(`Preparing foto banner for attachment: ${(fotobanner.size / 1024).toFixed(1)}KB`);
        // For attachment fields, we still need to convert to JSON format for API compatibility
        const base64 = await fileToBase64WebP(fotobanner);
        fotobannerData = JSON.stringify({
          id: `fb_${Date.now()}`,
          title: 'Foto Banner',
          url: base64,
          size: base64.length,
          type: 'banner'
        });
        console.log(`Foto banner prepared for attachment upload`);
      }
      
      const difuntoData: Difunto = {
        'Cliente ID': data['Cliente ID'],
        Nombre: data.Nombre,
        'Fecha Nacimiento': data['Fecha Nacimiento'],
        'Fecha Fallecimiento': data['Fecha Fallecimiento'],
        Historia: data.Historia,
        'Foto Principal': fotoPrincipalData || undefined,
        fotobanner: fotobannerData || undefined,
        'Video YouTube': data['Video YouTube'] || undefined,
        'Ubicación': data['Ubicación'] || undefined,
      };

      let createdDifunto;
      if (isEditing && difunto) {
        // Update existing difunto
        await clientApiService.updateDifunto((difunto.ID || difunto.id)?.toString() || '', difuntoData);
        createdDifunto = { ...difunto, ...difuntoData };
        alert('✅ Difunto actualizado exitosamente');
      } else {
        // Test data size before sending (attachment fields handle large files better)
        const dataSize = JSON.stringify(difuntoData).length;
        console.log(`Total data size: ${(dataSize / 1024).toFixed(1)}KB`);
        
        // Create new difunto with all optimized photos
        console.log(`Creating difunto with ${uploadedPhotos.length} gallery photos + optimized principal/banner`);
        createdDifunto = await clientApiService.createDifuntoWithPhotos(difuntoData, uploadedPhotos);
        
        const totalPhotos = uploadedPhotos.length + (fotoPrincipal ? 1 : 0) + (fotobanner ? 1 : 0);
        if (totalPhotos > 0) {
          alert(`✅ Difunto creado con ${totalPhotos} fotos exitosamente`);
        } else {
          alert('✅ Difunto creado exitosamente');
        }
      }
      
      reset();
      setFotoPrincipal(null);
      setFotobanner(null);
      setUploadedPhotos([]);
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        serverError: error.serverError
      });
      
      // Show more specific error message
      const errorMessage = error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el difunto`;
      alert(`❌ ${errorMessage}\n\nRevisa la consola del navegador para más detalles.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFotoPrincipalUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      console.log(`Processing foto principal: ${(file.size / 1024).toFixed(1)}KB`);
      const compressedFile = await compressImageToWebP(file, 600, 0.6);
      console.log(`Compressed to: ${(compressedFile.size / 1024).toFixed(1)}KB`);
      setFotoPrincipal(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error al procesar la imagen');
    } finally {
      setUploading(false);
    }
    event.target.value = '';
  }, []);

  const handleFotobannerUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      console.log(`Processing foto banner: ${(file.size / 1024).toFixed(1)}KB`);
      const compressedFile = await compressImageToWebP(file, 600, 0.6);
      console.log(`Compressed to: ${(compressedFile.size / 1024).toFixed(1)}KB`);
      setFotobanner(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error al procesar la imagen');
    } finally {
      setUploading(false);
    }
    event.target.value = '';
  }, []);

  const handlePhotoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const remainingSlots = 10 - uploadedPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) return;
    
    setUploading(true);
    
    try {
      console.log(`Processing ${filesToProcess.length} gallery photos...`);
      const compressedFiles = await Promise.all(
        filesToProcess.map(async (file, index) => {
          console.log(`Compressing gallery photo ${index + 1}: ${(file.size / 1024).toFixed(1)}KB`);
          const compressed = await compressImageToWebP(file, 1400, 0.85);
          console.log(`Gallery photo ${index + 1} compressed to: ${(compressed.size / 1024).toFixed(1)}KB`);
          return compressed;
        })
      );
      
      setUploadedPhotos(prev => [...prev, ...compressedFiles]);
    } catch (error) {
      console.error('Error compressing images:', error);
      alert('Error al procesar las imágenes');
    } finally {
      setUploading(false);
    }
    
    // Reset the input
    event.target.value = '';
  }, [uploadedPhotos.length]);
  
  const removePhoto = useCallback((index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const loadClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const response = await clientApiService.getClientes();
      setClientes(response.list || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadClientes();
    }
  }, [isOpen, loadClientes]);

  const handleClose = () => {
    reset();
    setFotoPrincipal(null);
    setFotobanner(null);
    setUploadedPhotos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Difunto' : 'Agregar Nuevo Difunto'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente Propietario *
            </label>
            <select
              {...register('Cliente ID')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingClientes}
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((cliente, index) => (
                <option key={cliente.Id || cliente.ID || cliente.id || `cliente-option-${index}`} value={(cliente.Id || cliente.ID || cliente.id)?.toString()}>
                  {cliente.Title || cliente.Nombre || cliente.nombre} - {cliente.email || cliente.Email}
                </option>
              ))}
            </select>
            {errors['Cliente ID'] && (
              <p className="text-red-500 text-sm mt-1">{errors['Cliente ID'].message}</p>
            )}
            {loadingClientes && (
              <p className="text-blue-500 text-sm mt-1">Cargando clientes...</p>
            )}
          </div>
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              {...register('Nombre')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Juan Pérez López"
            />
            {errors.Nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.Nombre.message}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                {...register('Fecha Nacimiento')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors['Fecha Nacimiento'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Fecha Nacimiento'].message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fallecimiento *
              </label>
              <input
                type="date"
                {...register('Fecha Fallecimiento')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors['Fecha Fallecimiento'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Fecha Fallecimiento'].message}</p>
              )}
            </div>
          </div>

          {/* Historia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Historia / Biografía *
            </label>
            <textarea
              {...register('Historia')}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Escribe la historia de vida, logros, personalidad y recuerdos especiales..."
            />
            {errors.Historia && (
              <p className="text-red-500 text-sm mt-1">{errors.Historia.message}</p>
            )}
          </div>

          {/* Foto Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Foto Principal (circular)
            </label>
            
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoPrincipalUpload}
                className="hidden"
                id="foto-principal-upload"
                disabled={uploading}
              />
              <label htmlFor="foto-principal-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-blue-400 mb-2" />
                <p className="text-blue-600">
                  {uploading ? 'Procesando...' : 'Subir Foto Principal'}
                </p>
              </label>
            </div>
            
            {fotoPrincipal && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={URL.createObjectURL(fotoPrincipal)}
                  alt="Foto Principal"
                  className="w-16 h-16 object-cover rounded-full border-2 border-blue-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Foto Principal</p>
                  <p className="text-xs text-gray-500">{fotoPrincipal.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFotoPrincipal(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Fotobanner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Foto Banner (fondo)
            </label>
            
            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFotobannerUpload}
                className="hidden"
                id="fotobanner-upload"
                disabled={uploading}
              />
              <label htmlFor="fotobanner-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-green-400 mb-2" />
                <p className="text-green-600">
                  {uploading ? 'Procesando...' : 'Subir Foto Banner'}
                </p>
              </label>
            </div>
            
            {fotobanner && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={URL.createObjectURL(fotobanner)}
                  alt="Fotobanner"
                  className="w-20 h-12 object-cover rounded border-2 border-green-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Foto Banner</p>
                  <p className="text-xs text-gray-500">{fotobanner.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFotobanner(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Galería de Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Galería de Fotos (hasta 10 fotos)
            </label>
            
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploadedPhotos.length >= 10 || uploading}
              />
              <label 
                htmlFor="photo-upload" 
                className={`cursor-pointer flex flex-col items-center ${uploadedPhotos.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="h-12 w-12 text-purple-400 mb-2" />
                <p className="text-purple-600">
                  {uploading ? 'Comprimiendo fotos...' : 
                   uploadedPhotos.length >= 10 ? 'Máximo 10 fotos alcanzado' :
                   'Subir Fotos para Galería'}
                </p>
                <p className="text-sm text-purple-500 mt-1">
                  {uploadedPhotos.length}/10 fotos seleccionadas
                </p>
              </label>
            </div>
            
            {uploadedPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedPhotos.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video YouTube */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Video de YouTube (opcional)
            </label>
            <input
              type="text"
              {...register('Video YouTube')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="dQw4w9WgXcQ"
            />
            <p className="text-gray-500 text-sm mt-1">
              Solo el ID del video, ejemplo: para https://youtube.com/watch?v=dQw4w9WgXcQ usa &quot;dQw4w9WgXcQ&quot;
            </p>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación del Descanso (opcional)
            </label>
            <input
              type="text"
              {...register('Ubicación')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Cementerio Nacional, Santo Domingo"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {submitting ? 
                (isEditing ? 'Actualizando...' : 'Creando...') : 
                (isEditing ? 'Actualizar Difunto' : 'Crear Difunto')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}