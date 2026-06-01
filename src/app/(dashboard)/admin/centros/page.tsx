'use client';

import { useState, useEffect } from 'react';
import { logisticaService, CentroAcopio, ItemInventario } from '@/services/logistica.service';
import { Comuna } from '@/types/necesidades.types';

export default function CentrosAcopioPage() {
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [centroExpandido, setCentroExpandido] = useState<string | null>(null);
  const [inventarios, setInventarios] = useState<Record<string, ItemInventario[]>>({});
  const [loadingInventario, setLoadingInventario] = useState<string | null>(null);

  // NUEVO: Estado para saber si estamos procesando un cambio
  const [procesandoEstado, setProcesandoEstado] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [centrosData, comunasData] = await Promise.all([
          logisticaService.obtenerTodosLosCentros(),
          logisticaService.obtenerComunas()
        ]);
        setCentros(Array.isArray(centrosData) ? centrosData : []);
        setComunas(Array.isArray(comunasData) ? comunasData : []);
      } catch (error) {
        console.error("Error al cargar los datos logísticos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const obtenerNombreComuna = (idComuna: number) => {
    const comuna = comunas.find(c => c.id === idComuna);
    return comuna ? comuna.nombre : 'Comuna desconocida';
  };

  const toggleInventario = async (idCentro: string) => {
    if (centroExpandido === idCentro) {
      setCentroExpandido(null);
      return;
    } 
    setCentroExpandido(idCentro);
    if (!inventarios[idCentro]) {
      setLoadingInventario(idCentro);
      try {
        const data = await logisticaService.obtenerInventarioPorCentro(idCentro);
        setInventarios(prev => ({ ...prev, [idCentro]: data }));
      } catch (error) {
        console.error(`Error al cargar inventario:`, error);
        setInventarios(prev => ({ ...prev, [idCentro]: [] }));
      } finally {
        setLoadingInventario(null);
      }
    }
  };

  // NUEVA FUNCIÓN: Cambia el estado en la BD y actualiza la UI
  const handleCambiarEstado = async (idCentro: string, estadoActual: string) => {
    // Si está activo, lo inactiva. Si está inactivo o nulo, lo activa.
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setProcesandoEstado(idCentro);

    try {
      await logisticaService.cambiarEstadoCentro(idCentro, nuevoEstado);
      
      // Actualizamos la tarjeta específica en la pantalla sin recargar todo
      setCentros(centros.map(c => 
        c.id === idCentro ? { ...c, estado: nuevoEstado } : c
      ));
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Hubo un error al intentar cambiar el estado del centro de acopio.");
    } finally {
      setProcesandoEstado(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-teal-600 font-bold animate-pulse">Cargando Red Logística...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-4">
      <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-teal-800">Red de Centros de Acopio</h2>
          <p className="text-gray-500 mt-1">Monitorea y administra la disponibilidad de tus bodegas.</p>
        </div>
      </div>

      {centros.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 mb-4">No hay centros de acopio registrados en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centros.map((centro) => (
            <div key={centro.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${centro.estado === 'INACTIVO' ? 'border-gray-200 opacity-75' : 'border-teal-100'}`}>
              
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{centro.nombre}</h3>
                  
                  {/* BOTÓN INTERACTIVO DE ESTADO */}
                  <button 
                    onClick={() => handleCambiarEstado(centro.id, centro.estado)}
                    disabled={procesandoEstado === centro.id}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${
                      procesandoEstado === centro.id ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-wait' :
                      centro.estado === 'ACTIVO' 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' 
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                    }`}
                    title={centro.estado === 'ACTIVO' ? 'Clic para Desactivar' : 'Clic para Activar'}
                  >
                    {procesandoEstado === centro.id ? 'Guardando...' : centro.estado || 'INACTIVO'}
                  </button>

                </div>
                <div className="flex items-center text-gray-500 text-sm mb-1 mt-4">
                  {centro.direccion}, <span className="font-semibold ml-1 text-gray-700">{obtenerNombreComuna(centro.idComuna)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4">
                <button 
                  onClick={() => toggleInventario(centro.id)}
                  className="w-full flex justify-between items-center text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  <span>Ver Ítems Almacenados (Inventario)</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${centroExpandido === centro.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {centroExpandido === centro.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {loadingInventario === centro.id ? (
                      <div className="text-center py-4 text-sm text-teal-600 animate-pulse">Consultando bodega a ms-logistica...</div>
                    ) : inventarios[centro.id] && inventarios[centro.id].length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {inventarios[centro.id].map((item, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-teal-100 flex items-center justify-between shadow-sm">
                            <span className="text-sm font-semibold text-gray-700 capitalize">
                              {item.categoria.replace('_', ' ')}
                            </span>
                            <div className="text-right">
                              <span className="block text-lg font-black text-teal-600 leading-none">{item.cantidad}</span>
                              <span className="text-[10px] uppercase font-bold text-gray-400">{item.unidadMedida}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm font-semibold text-gray-500">Bodega sin stock</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}