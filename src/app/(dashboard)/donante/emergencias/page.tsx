'use client';

import { useState, useEffect } from 'react';
import { necesidadesService } from '@/services/necesidades.service';
import { logisticaService, CentroAcopio } from '@/services/logistica.service';
import { NecesidadResponse, ItemNecesidad } from '@/types/necesidades.types';
import Link from 'next/link';

export default function EmergenciasActivasDonantePage() {
  const [necesidades, setNecesidades] = useState<NecesidadResponse[]>([]);
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataNecesidades, dataCentros] = await Promise.all([
          necesidadesService.obtenerTodas(),
          logisticaService.obtenerTodosLosCentros()
        ]);

        // Filtramos para que el donante SOLO vea las que están activas
        const activas = dataNecesidades.filter(n => n.estado === 'ACTIVA');
        setNecesidades(activas);
        
        // Filtramos centros que estén operando
        setCentros(dataCentros.filter(c => c.estado === 'ACTIVO'));
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const formatearTexto = (texto: string) => {
    if (!texto) return '';
    return texto.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para buscar centros en la misma comuna que la emergencia
  const obtenerCentrosRecomendados = (idComunaEmergencia: number) => {
    return centros.filter(c => c.idComuna === idComunaEmergencia);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-blue-900">Emergencias Activas</h2>
        <p className="text-gray-500 mt-1 text-lg">Descubre dónde se necesita ayuda y qué artículos urgen en este momento.</p>
      </div>

      {necesidades.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay emergencias activas</h3>
          <p className="text-gray-500">En este momento todas las campañas de ayuda han sido cubiertas. ¡Gracias por tu interés en aportar!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {necesidades.map((necesidad) => {
            const centrosRecomendados = obtenerCentrosRecomendados(necesidad.idComuna);

            return (
              <div key={necesidad.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                
                {/* COLUMNA IZQUIERDA: Info de Emergencia */}
                <div className="p-8 md:w-2/3 border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide animate-pulse">
                      URGENTE
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{necesidad.direccionEspecifica || 'Zona Afectada'}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{necesidad.tituloEmergencia}</h3>

                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">¿Qué se necesita?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {necesidad.items?.map((item, idx) => {
                      const faltan = Math.max(0, item.cantidadRequerida - (item.cantidadCubierta || 0));
                      const completado = faltan === 0;

                      return (
                        <div key={idx} className={`p-4 rounded-xl border ${completado ? 'bg-green-50 border-green-100' : 'bg-blue-50/50 border-blue-100'}`}>
                          <p className="font-bold text-gray-800 flex items-center justify-between">
                            {formatearTexto(item.categoria)}
                            {completado && <span className="text-green-600 text-sm">Cubierto</span>}
                          </p>
                          {!completado && (
                            <>
                              <p className="text-xs text-gray-500 mt-1">{item.descripcionItem}</p>
                              <p className="text-sm font-semibold text-blue-700 mt-2">
                                Faltan: {faltan} {formatearTexto(item.unidadMedida)}
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMNA DERECHA: Dónde Donar */}
                <div className="p-8 md:w-1/3 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        Centros de Acopio
                    </h4>
                    
                    {centrosRecomendados.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        <p className="text-xs text-gray-500 mb-2">Centros cercanos recomendados:</p>
                        {centrosRecomendados.map(centro => (
                          <div key={centro.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <p className="font-bold text-sm text-gray-800">{centro.nombre}</p>
                            <p className="text-xs text-gray-500 mt-1">{centro.direccion}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border border-yellow-200 mb-6">
                        <p className="text-sm text-yellow-800 font-medium">No hay centros en esta misma comuna.</p>
                        <p className="text-xs text-yellow-600 mt-1">Revisa la red general para encontrar el más cercano.</p>
                      </div>
                    )}
                  </div>

                  <Link 
                    href="/donante/nueva-donacion"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md hover:shadow-lg"
                  >
                    Hacer un Aporte
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}