'use client';

import { useEffect, useState } from 'react';
import { Difunto, Cliente } from '../../../lib/nocodb';
import { clientApiService } from '../../../lib/client-api';
import { downloadQRCode } from '../../../lib/download-utils';
import { Plus, Edit2, Trash2, QrCode, Eye } from 'lucide-react';
import DifuntoFormModal from '../../components/DifuntoForm';
import ClienteFormModal from '../../components/ClienteForm';

export default function AdminPage() {
  const [difuntos, setDifuntos] = useState<Difunto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('difuntos');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDifunto, setEditingDifunto] = useState<Difunto | undefined>(undefined);
  const [showClienteFormModal, setShowClienteFormModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [difuntosData, clientesData] = await Promise.all([
        clientApiService.getDifuntos(),
        clientApiService.getClientes()
      ]);
      setDifuntos(difuntosData.list || []);
      setClientes(clientesData.list || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (difunto: Difunto) => {
    const difuntoId = (difunto.Id || difunto.ID || difunto.id)?.toString() || '';
    const difuntoNombre = difunto.Nombre || difunto.nombre || 'difunto';
    
    try {
      setGeneratingQR(difuntoId);
      
      // Generate QR code via API with initials
      const qrResponse = await clientApiService.generateQRCode(difuntoId, difuntoNombre);
      
      // Download the QR code
      const downloaded = downloadQRCode(qrResponse.qrCode, difuntoNombre);
      
      if (downloaded) {
        const initialsText = qrResponse.initials ? `\n🏷️ Iniciales: ${qrResponse.initials}` : '';
        alert(`✅ Código QR generado y descargado exitosamente para ${difuntoNombre}${initialsText}\n🌐 URL: ${qrResponse.url}`);
      } else {
        alert('QR generado pero hubo un problema con la descarga. Puedes intentar de nuevo.');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('❌ Error al generar código QR. Por favor intenta de nuevo.');
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        console.log('Eliminando difunto con ID:', id);
        await clientApiService.deleteDifunto(id);
        console.log('Difunto eliminado exitosamente, recargando datos...');
        alert('Registro eliminado correctamente.');
        await loadData(); // Hacer la carga asíncrona para asegurar que se complete
        console.log('Datos recargados');
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error al eliminar el registro. Por favor intenta de nuevo.');
      }
    }
  };

  const handleAddDifunto = () => {
    setEditingDifunto(undefined);
    setShowFormModal(true);
  };

  const handleEditDifunto = (difunto: Difunto) => {
    setEditingDifunto(difunto);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    loadData();
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setEditingDifunto(undefined);
  };

  // Cliente functions
  const handleDeleteCliente = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await clientApiService.deleteCliente(id);
        alert('Cliente eliminado correctamente.');
        loadData();
      } catch (error) {
        console.error('Error deleting cliente:', error);
        alert('Error al eliminar el cliente. Por favor intenta de nuevo.');
      }
    }
  };

  const handleAddCliente = () => {
    setEditingCliente(undefined);
    setShowClienteFormModal(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowClienteFormModal(true);
  };

  const handleClienteFormSuccess = () => {
    loadData();
  };

  const handleCloseClienteForm = () => {
    setShowClienteFormModal(false);
    setEditingCliente(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo - Recuerdo Eterno</h1>
            </div>
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('difuntos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'difuntos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Difuntos
              </button>
              <button
                onClick={() => setActiveTab('clientes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clientes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Clientes
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'difuntos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Gestión de Difuntos</h2>
                  <button 
                    onClick={handleAddDifunto}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Agregar Difunto</span>
                  </button>
                </div>

                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fechas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          QR Personalizado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-max">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {difuntos.map((difunto, index) => (
                        <tr key={difunto.Id || difunto.ID || difunto.id || `difunto-${index}`} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {difunto.Nombre || difunto.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {difunto['Fecha Nacimiento'] || difunto.fecha_nacimiento} - {difunto['Fecha Fallecimiento'] || difunto.fecha_fallecimiento}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              Con iniciales ({(difunto.Nombre || difunto.nombre || '').split(' ').map(n => n.charAt(0)).join('')})
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-1 flex-wrap gap-1">
                              <button 
                                onClick={() => window.open(`/difunto/${difunto.Id || difunto.ID || difunto.id}`, '_blank')}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                title="Ver página conmemorativa"
                              >
                                <Eye size={14} className="mr-1" />
                                Ver
                              </button>
                              
                              <button 
                                onClick={() => handleEditDifunto(difunto)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                title="Editar información"
                              >
                                <Edit2 size={14} className="mr-1" />
                                Editar
                              </button>
                              
                              <button 
                                onClick={() => handleGenerateQR(difunto)}
                                disabled={generatingQR === (difunto.Id || difunto.ID || difunto.id)?.toString()}
                                className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  generatingQR === (difunto.Id || difunto.ID || difunto.id)?.toString()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                }`}
                                title="Generar código QR personalizado con iniciales"
                              >
                                {generatingQR === (difunto.Id || difunto.ID || difunto.id)?.toString() ? (
                                  <>
                                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                                    Generando...
                                  </>
                                ) : (
                                  <>
                                    <QrCode size={14} className="mr-1" />
                                    QR
                                  </>
                                )}
                              </button>
                              
                              <button 
                                onClick={() => handleDelete((difunto.Id || difunto.ID || difunto.id)?.toString() || '')}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                title="Eliminar registro"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'clientes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Gestión de Clientes</h2>
                  <button 
                    onClick={handleAddCliente}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Agregar Cliente</span>
                  </button>
                </div>

                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-max">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientes.map((cliente, index) => (
                        <tr key={cliente.Id || cliente.ID || cliente.id || `cliente-${index}`} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.Title || cliente.Nombre || cliente.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {cliente.email || cliente.Email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {cliente.Teléfono || cliente.telefono || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-1 flex-wrap gap-1">
                              <button 
                                onClick={() => handleEditCliente(cliente)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                title="Editar cliente"
                              >
                                <Edit2 size={14} className="mr-1" />
                                Editar
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteCliente((cliente.Id || cliente.ID || cliente.id)?.toString() || '')}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                title="Eliminar cliente"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para formulario de difunto */}
      <DifuntoFormModal 
        isOpen={showFormModal}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        difunto={editingDifunto}
      />
      
      {/* Modal para formulario de cliente */}
      <ClienteFormModal 
        isOpen={showClienteFormModal}
        onClose={handleCloseClienteForm}
        onSuccess={handleClienteFormSuccess}
        cliente={editingCliente}
      />
    </div>
  );
}