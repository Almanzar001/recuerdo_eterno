'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Difunto, Foto, Comentario } from '../../../../lib/nocodb';
import { clientApiService } from '../../../../lib/client-api';
import { Heart, MapPin, Calendar, MessageCircle, Play, Image, BookOpen } from 'lucide-react';
import PhotoGallery from '@/components/PhotoGallery';
import CommentSection from '@/components/CommentSection';
import ProfileFlipCard from '@/components/ProfileFlipCard';
import RELogo from '@/components/RELogo';

export default function DifuntoPage() {
  const params = useParams();
  const [difunto, setDifunto] = useState<Difunto | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('historia');
  const [enlargedImage, setEnlargedImage] = useState<{url: string, title: string} | null>(null);

  useEffect(() => {
    if (params.id) {
      loadDifunto();
    }
  }, [params.id]);

  // Funciones para manejar el modal de imagen ampliada
  const openImageModal = (url: string, title: string) => {
    setEnlargedImage({ url, title });
  };

  const closeImageModal = () => {
    setEnlargedImage(null);
  };

  // Función helper para extraer URL de attachment
  const getImageUrl = (imageField: any, fallbackUrl?: string): string => {
    if (Array.isArray(imageField) && imageField.length > 0) {
      const attachment = imageField[0];
      return attachment.signedUrl || attachment.url || (attachment.path ? `/api/proxy-image/${attachment.path}` : '');
    }
    
    if (typeof imageField === 'string') {
      if (imageField.startsWith('data:')) {
        return imageField;
      }
      if (imageField.startsWith('{')) {
        try {
          const data = JSON.parse(imageField);
          return data.url || '';
        } catch {
          return '';
        }
      }
      return imageField;
    }
    
    return fallbackUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
  };

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && enlargedImage) {
        closeImageModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enlargedImage]);

  const loadDifunto = async () => {
    try {
      setLoading(true);
      const difuntoData = await clientApiService.getDifuntoById(params.id as string);
      const fotosData = await clientApiService.getFotosByDifunto(params.id as string);
      
      console.log('=== DIFUNTO PAGE DEBUG ===');
      console.log('Difunto data:', difuntoData);
      console.log('Fotos data:', fotosData);
      console.log('Fotos list:', fotosData.list);
      console.log('=== END DEBUG ===');
      
      setDifunto(difuntoData);
      setFotos(fotosData.list || []);
    } catch (error) {
      console.error('Error loading difunto:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${parseInt(day)}/${months[parseInt(month) - 1]}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!difunto) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Página no encontrada</h1>
          <p className="text-gray-600">La página conmemorativa que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Memorial Card Layout */}
      <div className="w-full mx-auto md:max-w-full px-2 md:px-0 py-4 md:py-0">
        
        {/* Memorial Card */}
        <div className="bg-white md:rounded-none rounded-lg shadow-2xl md:shadow-none overflow-hidden min-h-screen md:min-h-screen">
          
          {/* Golden Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-6 py-1 md:py-3 text-center">
            <div className="flex items-center justify-center">
              <RELogo size={63} />
              <h1 className="text-white text-3xl md:text-4xl font-elegant ml-3" style={{fontFamily: 'serif'}}>
                Recuerdo Eterno
              </h1>
            </div>
          </div>

          {/* En Memoria de */}
          <div className="bg-gray-50 py-2 md:py-3 text-center border-b">
            <h2 className="text-lg md:text-xl font-bold text-gray-800" style={{fontFamily: 'serif'}}>
              En Memoria de:
            </h2>
          </div>

          {/* Background Photos Banner */}
          <div className="relative">
            {(() => {
              const bannerUrl = getImageUrl(difunto.fotobanner);
              
              return (bannerUrl || fotos.length > 0) && (
                <div className="h-64 md:h-96">
                  {bannerUrl ? (
                    <div 
                      className="w-full h-full bg-cover bg-center cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      style={{
                        backgroundImage: `url(${bannerUrl})`
                      }}
                      onClick={() => openImageModal(bannerUrl, '')}
                      title="Haz clic para ver la imagen completa"
                    />
                  ) : (
                    <div className="flex h-full">
                      {fotos.slice(0, 3).map((foto, index) => (
                        <div 
                          key={foto.ID || foto.id} 
                          className="flex-1 bg-cover bg-center cursor-pointer hover:opacity-90 transition-opacity duration-200"
                          style={{
                            backgroundImage: `url(${foto.url || foto.URL})`
                          }}
                          onClick={() => openImageModal(foto.url || foto.URL || '', '')}
                          title="Haz clic para ver la imagen completa"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {/* Profile Photo Circle - Positioned at bottom of banner */}
            <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{bottom: '-100px'}}>
              <div className="relative">
                <div 
                  className="w-40 h-40 md:w-52 md:h-52 lg:w-68 lg:h-68 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-cover bg-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  style={{
                    backgroundImage: `url(${getImageUrl(difunto.foto_principal || difunto['Foto Principal'])})`
                  }}
                  onClick={() => {
                    const profileUrl = getImageUrl(difunto.foto_principal || difunto['Foto Principal']);
                    openImageModal(profileUrl, '');
                  }}
                  title="Haz clic para ver la foto completa"
                >
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-16 text-center relative mt-20 md:mt-28">

            {/* Name */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 relative z-10" style={{fontFamily: 'serif'}}>
              {difunto.nombre || difunto.Nombre}
            </h1>

            {/* Divider */}
            <div className="w-32 md:w-40 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-8"></div>

            {/* Dates */}
            <div className="text-lg md:text-xl text-gray-700 mb-4 font-medium relative z-10">
              {formatDate(difunto.fecha_nacimiento || difunto['Fecha Nacimiento'] || '')} – {formatDate(difunto.fecha_fallecimiento || difunto['Fecha Fallecimiento'] || '')}
            </div>

            {/* Location */}
            {(difunto.ubicacion || difunto.Ubicación) && (
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-8 relative z-10">
                <MapPin size={18} />
                <span className="text-base md:text-lg">{difunto.ubicacion || difunto.Ubicación}</span>
              </div>
            )}

            {/* Brief Description */}
            {(difunto.historia || difunto.Historia) && (
              <div className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-2xl md:max-w-4xl mx-auto relative z-10">
                <p>
                  {(difunto.historia || difunto.Historia)?.split('\n')[0].substring(0, 150)}
                  {(difunto.historia || difunto.Historia)?.length > 150 ? '...' : ''}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 relative z-10">
              <button
                onClick={() => setActiveSection('fotos')}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-full border-2 transition-all text-base md:text-lg font-medium ${
                  activeSection === 'fotos'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-lg'
                    : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                Fotos
              </button>
              <button
                onClick={() => setActiveSection('videos')}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-full border-2 transition-all text-base md:text-lg font-medium ${
                  activeSection === 'videos'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-lg'
                    : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveSection('historia')}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-full border-2 transition-all text-base md:text-lg font-medium ${
                  activeSection === 'historia'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-lg'
                    : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                Historia
              </button>
            </div>

            {/* Content Section */}
            <div className="border-t border-gray-200 pt-8 relative z-10">
              {activeSection === 'historia' && (difunto.historia || difunto.Historia) && (
                <div className="text-left max-w-4xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Su Historia</h3>
                  <div className="text-gray-700 leading-relaxed text-base md:text-lg space-y-4">
                    {(difunto.historia || difunto.Historia)?.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'fotos' && fotos.length > 0 && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Galería de Fotos</h3>
                  <PhotoGallery fotos={fotos} />
                </div>
              )}

              {activeSection === 'videos' && (difunto.video_youtube || difunto['Video YouTube']) && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Videos Conmemorativos</h3>
                  <div className="aspect-video rounded-lg overflow-hidden max-w-4xl mx-auto">
                    <iframe
                      src={`https://www.youtube.com/embed/${difunto.video_youtube || difunto['Video YouTube']}`}
                      title="Video conmemorativo"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {activeSection === 'videos' && !(difunto.video_youtube || difunto['Video YouTube']) && (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">No hay videos disponibles</p>
                </div>
              )}

              {activeSection === 'fotos' && fotos.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">No hay fotos disponibles</p>
                </div>
              )}
            </div>

          </div>



        </div>

      </div>

      {/* Modal para imagen ampliada */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={closeImageModal}
        >
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
            {/* Botón de cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-opacity-70"
              style={{ zIndex: 100001 }}
            >
              ✕
            </button>

            {/* Imagen principal */}
            <div 
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedImage.url}
                alt={enlargedImage.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>

            {/* Instrucciones */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full">
              Presiona Escape o haz clic fuera para cerrar
            </div>
          </div>
        </div>
      )}

      {/* Estilos para text-shadow */}
      <style jsx>{`
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .text-shadow-lg {
          text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
}