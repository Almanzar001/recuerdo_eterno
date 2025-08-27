'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Comentario } from '../../lib/nocodb';
import { clientApiService } from '../../lib/client-api';
import { MessageCircle, Heart, Send } from 'lucide-react';

const commentSchema = z.object({
  autor: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  comentario: z.string().min(1, 'El comentario es requerido').max(500, 'Máximo 500 caracteres'),
});

type CommentForm = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  difuntoId: string;
  fotoId?: string;
  compact?: boolean;
}

export default function CommentSection({ difuntoId, fotoId, compact = false }: CommentSectionProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema)
  });

  useEffect(() => {
    loadComentarios();
  }, [difuntoId]);

  const loadComentarios = async () => {
    try {
      setLoading(true);
      const data = await clientApiService.getComentariosByDifunto(difuntoId);
      setComentarios(data.list || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CommentForm) => {
    try {
      setSubmitting(true);
      
      const comentario: Comentario = {
        Autor: data.autor,
        Email: data.email || undefined,
        Comentario: data.comentario,
        Aprobado: true // Auto-approve for now
      };

      // Create the comment first
      const createdComment = await clientApiService.createComentario(comentario);
      
      // If we have a fotoId, link the comment to the photo
      // If not, link to the first photo of the difunto
      if (createdComment.ID) {
        try {
          if (fotoId) {
            // Link to specific photo
            console.log('Linking comment to photo:', fotoId);
          } else {
            // Get first photo of difunto and link to it
            const fotosData = await clientApiService.getFotosByDifunto(difuntoId);
            const fotos = fotosData.list || [];
            if (fotos.length > 0) {
              const firstPhoto = fotos[0];
              console.log('Linking comment to first photo:', firstPhoto.ID);
              // Note: Would need to implement comment-photo linking in the API
            }
          }
        } catch (linkError) {
          console.warn('Could not link comment to photo:', linkError);
        }
      }
      
      reset();
      setShowForm(false);
      
      // Show success message
      alert('Comentario enviado. Será publicado después de la moderación.');
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error al enviar el comentario. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-2">
            <p className="text-gray-500 text-xs">Cargando...</p>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-gray-500 text-xs">Sin comentarios</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {comentarios.slice(0, 3).map((comentario) => (
              <div key={comentario.ID || comentario.id} className="bg-gray-50 rounded p-2">
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs">
                    {(comentario.Autor || comentario.autor)?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {comentario.Autor || comentario.autor}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {comentario.Comentario || comentario.comentario}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {comentarios.length > 3 && (
              <p className="text-xs text-blue-500 text-center">+{comentarios.length - 3} más</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <MessageCircle size={24} />
          <span>Comentarios ({comentarios.length})</span>
        </h3>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <MessageCircle size={16} />
            <span>Escribir comentario</span>
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  {...register('autor')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
                {errors.autor && (
                  <p className="text-red-500 text-sm mt-1">{errors.autor.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario *
              </label>
              <textarea
                {...register('comentario')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Comparte un recuerdo, pensamiento o mensaje..."
              />
              {errors.comentario && (
                <p className="text-red-500 text-sm mt-1">{errors.comentario.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Send size={16} />
                <span>{submitting ? 'Enviando...' : 'Enviar comentario'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando comentarios...</p>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              Aún no hay comentarios. Sé el primero en compartir un recuerdo.
            </p>
          </div>
        ) : (
          comentarios.map((comentario) => (
            <div
              key={comentario.ID || comentario.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {(comentario.Autor || comentario.autor)?.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{comentario.Autor || comentario.autor}</h4>
                    <span className="text-gray-400 text-sm">•</span>
                    <time className="text-gray-500 text-sm">
                      {(comentario.Creado || comentario.created_at) ? 
                        new Date(comentario.Creado || comentario.created_at!).toLocaleDateString() : 
                        'Fecha no disponible'
                      }
                    </time>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {comentario.Comentario || comentario.comentario}
                  </p>
                  
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart size={16} />
                    <span className="text-sm">Me gusta</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}