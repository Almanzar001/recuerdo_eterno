'use client';

import { useState, useEffect } from 'react';
import { Foto } from '../../lib/nocodb';

interface PhotoGalleryProps {
  fotos: Foto[];
}

export default function PhotoGallery({ fotos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Foto | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Manejar teclas del teclado para navegación
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPhoto();
      } else if (e.key === 'ArrowRight') {
        goToNextPhoto();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentPhotoIndex]);

  const openModal = (foto: Foto) => {
    const index = fotos.findIndex(f => (f.ID || f.id) === (foto.ID || foto.id));
    setCurrentPhotoIndex(index);
    setSelectedPhoto(foto);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const goToNextPhoto = () => {
    const nextIndex = (currentPhotoIndex + 1) % fotos.length;
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(fotos[nextIndex]);
  };

  const goToPreviousPhoto = () => {
    const prevIndex = (currentPhotoIndex - 1 + fotos.length) % fotos.length;
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(fotos[prevIndex]);
  };



  const toggleFlip = (fotoId: number) => {
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(fotoId)) {
      newFlippedCards.delete(fotoId);
    } else {
      newFlippedCards.add(fotoId);
    }
    setFlippedCards(newFlippedCards);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fotos.map((foto) => (
          <div key={foto.ID || foto.id} className="relative group">
            <div 
              className="relative w-full h-64 cursor-pointer"
              onClick={() => toggleFlip((foto.ID || foto.id)!)}
            >
              {/* Photo Card - Final version */}
              <div className="relative group">
                <img
                  src={foto.url || foto.URL}
                  alt={(foto.descripcion || foto.Descripción) || 'Foto conmemorativa'}
                  style={{ 
                    width: '100%',
                    height: '256px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    display: 'block',
                    opacity: '1',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.3s ease'
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#f5f5f5';
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#fee2e2';
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.transform = 'scale(1)';
                  }}
                  onClick={() => openModal(foto)}
                />
                
                {/* Hover overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'opacity 0.3s ease',
                    cursor: 'pointer'
                  }}
                  className="group-hover:opacity-100"
                  onClick={() => openModal(foto)}
                >
                  <div style={{ color: 'white', textAlign: 'center', padding: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Ver imagen completa
                    </p>
                    {(foto.descripcion || foto.Descripción) && (
                      <p style={{ fontSize: '12px', opacity: 0.9 }}>
                        {foto.descripcion || foto.Descripción}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal mejorado para foto en pantalla completa */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closeModal}
        >
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
            {/* Botón de cerrar - más prominente */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-opacity-70"
              style={{ zIndex: 10001 }}
            >
              ✕
            </button>

            {/* Botón anterior */}
            {fotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousPhoto();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-opacity-70"
                style={{ zIndex: 10001 }}
              >
                ‹
              </button>
            )}

            {/* Botón siguiente */}
            {fotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextPhoto();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-opacity-70"
                style={{ zIndex: 10001 }}
              >
                ›
              </button>
            )}

            {/* Imagen principal */}
            <div 
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url || selectedPhoto.URL}
                alt={(selectedPhoto.descripcion || selectedPhoto.Descripción) || 'Foto conmemorativa'}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                }}
              />

              {/* Descripción de la foto */}
              {(selectedPhoto.descripcion || selectedPhoto.Descripción) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 rounded-b-lg">
                  <p className="text-center text-sm md:text-base">
                    {selectedPhoto.descripcion || selectedPhoto.Descripción}
                  </p>
                </div>
              )}

              {/* Contador de fotos */}
              {fotos.length > 1 && (
                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {fotos.length}
                </div>
              )}
            </div>

            {/* Instrucciones de navegación */}
            {fotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full">
                Usa las flechas ← → o haz clic en los botones para navegar
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  );
}