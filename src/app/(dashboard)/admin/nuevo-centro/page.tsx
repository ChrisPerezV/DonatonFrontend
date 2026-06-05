'use client';

import { useState, useEffect } from 'react';
import { logisticaService, NuevoCentroRequest } from '@/services/logistica.service';
import { Comuna } from '@/types/necesidades.types';

export default function NuevoCentroAcopioPage() {
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargandoComunas, setCargandoComunas] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const [formData, setFormData] = useState<NuevoCentroRequest>({
    nombre: '',
    direccion: '',
    idComuna: 0,
  });

  // Cargar las comunas reales al iniciar la pantalla
  useEffect(() => {
    const cargarComunas = async () => {
      try {
        const datos = await logisticaService.obtenerComunas();
        setComunas(datos);
        if (datos.length > 0) {
          setFormData(prev => ({ ...prev, idComuna: datos[0].id }));
        }
      } catch (error) {
        console.error("Error cargando comunas", error);
      } finally {
        setCargandoComunas(false);
      }
    };
    cargarComunas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      await logisticaService.crearCentroAcopio(formData);
      setMensaje({ texto: '¡Centro de acopio registrado exitosamente!', tipo: 'exito' });
      
      // Limpiar formulario tras éxito
      setFormData({
        nombre: '',
        direccion: '',
        idComuna: comunas[0]?.id || 0,
      });
    } catch (error: any) {
      setMensaje({ 
        texto: error.response?.data?.message || 'Error al registrar el centro de acopio.', 
        tipo: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-6">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-3xl font-bold text-teal-800">Nuevo Centro de Acopio</h2>
        <p className="text-gray-500 mt-1">Habilita un nuevo punto logístico para la recepción de ayuda.</p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Recinto</label>
          <input
            type="text"
            required
            minLength={4}
            placeholder="Ej. Gimnasio Municipal, Colegio San José..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white disabled:bg-gray-100"
            value={formData.idComuna}
            onChange={(e) => setFormData({ ...formData, idComuna: parseInt(e.target.value) })}
            disabled={cargandoComunas}
          >
            {cargandoComunas ? (
              <option>Cargando comunas...</option>
            ) : comunas.length === 0 ? (
              <option>No hay comunas disponibles</option>
            ) : (
              comunas.map((comuna) => (
                <option key={comuna.id} value={comuna.id}>
                  {comuna.nombre}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección Exacta</label>
          <input
            type="text"
            required
            minLength={5}
            placeholder="Ej. Avenida Los Pinos 456"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || cargandoComunas}
          className="w-full mt-8 bg-teal-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-teal-700 hover:shadow-lg transition duration-200 disabled:bg-gray-400 disabled:shadow-none"
        >
          {loading ? 'Guardando...' : 'Habilitar Centro de Acopio'}
        </button>
      </form>
    </div>
  );
}