import Link from "next/link";
import { Heart, QrCode, Users, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="text-red-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-900">Recuerdo Eterno</h1>
            </div>
            <Link
              href="/admin"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Settings size={16} />
              <span>Panel Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Mantenemos vivos los recuerdos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Crea páginas conmemorativas únicas y personalizadas para honrar la memoria 
            de tus seres queridos. Con fotos, historias, videos y un código QR para 
            acceso fácil desde cualquier dispositivo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <QrCode className="mx-auto text-blue-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Código QR Único</h3>
            <p className="text-gray-600">
              Cada página conmemorativa incluye un código QR único para acceso 
              rápido desde dispositivos móviles.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Heart className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Galería de Recuerdos</h3>
            <p className="text-gray-600">
              Comparte fotos, videos y historias especiales con efectos visuales 
              elegantes y respetuosos.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Users className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Comentarios Familiares</h3>
            <p className="text-gray-600">
              Permite que familiares y amigos compartan recuerdos y mensajes 
              en un espacio moderado y seguro.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-sm p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Cómo funciona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Registro</h3>
              <p className="text-gray-600 text-sm">
                El administrador registra al difunto o envía formulario al cliente
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Información</h3>
              <p className="text-gray-600 text-sm">
                Se completa con fotos, videos, historia y biografía personal
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">QR Generado</h3>
              <p className="text-gray-600 text-sm">
                Se genera código QR único que se coloca en la lápida
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Acceso</h3>
              <p className="text-gray-600 text-sm">
                Familiares y visitantes acceden escaneando el código QR
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Heart className="text-red-400" size={24} />
            <span className="text-xl font-semibold">Recuerdo Eterno</span>
          </div>
          <p className="text-gray-400 mb-4">
            Creando memoriales digitales que perduran en el tiempo
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Recuerdo Eterno. Desarrollado con cariño y respeto.
          </p>
        </div>
      </footer>
    </div>
  );
}
