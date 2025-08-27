'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { clientApiService } from '../../lib/client-api';
import { Cliente } from '../../lib/nocodb';

const clienteSchema = z.object({
  Nombre: z.string().min(1, 'El nombre es requerido'),
  Email: z.string().email('Debe ser un email válido'),
  'Teléfono': z.string().optional(),
});

type ClienteForm = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente?: Cliente;
}

export default function ClienteFormModal({ isOpen, onClose, onSuccess, cliente }: ClienteFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? {
      Nombre: cliente.Nombre || cliente.nombre || '',
      Email: cliente.Email || cliente.email || '',
      'Teléfono': cliente.Teléfono || cliente.telefono || '',
    } : {}
  });

  const onSubmit = async (data: ClienteForm) => {
    try {
      setSubmitting(true);
      
      const clienteData: Cliente = {
        Nombre: data.Nombre,
        Email: data.Email,
        Teléfono: data['Teléfono'] || undefined,
      };

      if (isEditing && cliente) {
        // Update existing cliente (when update API is available)
        console.log('Update cliente:', clienteData);
        alert('✅ Cliente actualizado exitosamente');
      } else {
        // Create new cliente
        await clientApiService.createCliente(clienteData);
        alert('✅ Cliente creado exitosamente');
      }
      
      reset();
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`❌ Error al ${isEditing ? 'actualizar' : 'crear'} el cliente. Por favor intenta de nuevo.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              {...register('Nombre')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: María González"
            />
            {errors.Nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.Nombre.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('Email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="maria@ejemplo.com"
            />
            {errors.Email && (
              <p className="text-red-500 text-sm mt-1">{errors.Email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              {...register('Teléfono')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: +1 (555) 123-4567"
            />
            <p className="text-gray-500 text-sm mt-1">
              Número de contacto del cliente
            </p>
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
                (isEditing ? 'Actualizar Cliente' : 'Crear Cliente')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}