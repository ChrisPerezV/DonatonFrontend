'use client';

import { useState, useEffect } from 'react';
import { donacionesService } from '@/services/donaciones.service';
import { CentroAcopio } from '@/types/donaciones.types';
import Link from 'next/link';
import Cookies from 'js-cookie'; // <-- IMPORTAMOS LAS COOKIES

export default function MisDonacionesPage() {
  const [donaciones, setDonaciones] = useState<any[]>([]);
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // --- 1. OBTENEMOS EL ID EXACTAMENTE COMO EN NUEVA-DONACION ---
        const idUsuarioActual = Cookies.get('idUsuario');

        // Si la cookie no existe (sesión expirada o no logueado), detenemos la ejecución
        if (!idUsuarioActual) {
          setError('No se pudo identificar tu sesión. Por favor, vuelve a iniciar sesión.');
          setLoading(false);
          return; 
        }

        // --- 2. CARGAMOS LOS DATOS CON EL ID REAL ---
        const [dataDonaciones, dataCentros] = await Promise.all([
          donacionesService.obtenerMisDonaciones(idUsuarioActual),
          donacionesService.obtenerCentrosAcopio()
        ]);
        
        setDonaciones(dataDonaciones);
        setCentros(dataCentros);
      } catch (err) {
        console.error("Error en la petición:", err);
        setError('No se pudo cargar la información completa del servidor.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const obtenerNombreCentro = (id: string) => {
    const centroEncontrado = centros.find((c) => c.id === id);
    return centroEncontrado ? centroEncontrado.nombre : 'Centro Desconocido';
  };

  const formatearEnum = (texto: string) => {
    if (!texto) return '';
    return texto.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Mis Donaciones</h2>
          <p className="text-gray-500 text-sm mt-1">Historial de tus aportes registrados en el sistema.</p>
        </div>
        <Link 
          href="/donante/nueva-donacion" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
        >
          Nuevo Aporte
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : donaciones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Aún no has registrado ninguna donación.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <th className="p-4 font-semibold text-sm w-32">ID Aporte</th>
                <th className="p-4 font-semibold text-sm w-32">Tipo</th>
                <th className="p-4 font-semibold text-sm">Centro Destino</th>
                <th className="p-4 font-semibold text-sm">Detalle de Ítems</th>
                <th className="p-4 font-semibold text-sm w-24">Estado</th>
              </tr>
            </thead>
            <tbody>
              {donaciones.map((donacion, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition align-top">
                  
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {donacion.id ? donacion.id.substring(0, 8).toUpperCase() : `D-${index + 1}`}
                  </td>
                  
                  <td className="p-4 text-sm text-gray-800">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs font-bold tracking-wide">
                      {donacion.tipoDonacion}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-700 font-medium">
                    📍 {obtenerNombreCentro(donacion.idCentroAcopio)}
                  </td>
                  
                  <td className="p-4 text-sm text-gray-600">
                    {donacion.items && donacion.items.length > 0 ? (
                      <ul className="space-y-1">
                        {donacion.items.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>
                              <strong className="text-gray-800">{item.cantidad} {formatearEnum(item.unidadMedida)}</strong> de {formatearEnum(item.categoria)}
                              {item.descripcionItem && <span className="text-gray-400 italic text-xs ml-1">({item.descripcionItem})</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Sin detalles</span>
                    )}
                  </td>
                  
                  <td className="p-4 text-sm">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                      {donacion.estadoDonacion || 'REGISTRADA'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}