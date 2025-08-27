'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import CommentSection from './CommentSection';

interface ProfileFlipCardProps {
  photoUrl: string;
  altText: string;
  difuntoId: string;
}

export default function ProfileFlipCard({ photoUrl, altText, difuntoId }: ProfileFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Cara frontal - Foto de perfil */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={altText}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Sin foto</span>
              </div>
            )}
          </div>
          {/* Indicador de comentarios */}
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg">
            <MessageCircle size={16} />
          </div>
        </div>

        {/* Cara trasera - Comentarios */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full rounded-full border-4 border-white shadow-2xl bg-white overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Header de comentarios */}
              <div className="bg-blue-500 text-white p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle size={16} />
                  <span className="text-sm font-medium">Comentarios</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="hover:bg-blue-600 rounded-full p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Contenido de comentarios compacto */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-2 text-xs">
                  <CommentSection difuntoId={difuntoId} compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}