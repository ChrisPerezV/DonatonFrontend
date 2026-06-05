'use client';

import { useState, useEffect } from 'react';
import { logisticaService, DespachoTrazabilidad } from '@/services/logistica.service';
import { necesidadesService } from '@/services/necesidades.service';
import { NecesidadResponse } from '@/types/necesidades.types';

export default function GestionDespachosPage() {
  const [despachos, setDespachos] = useState<DespachoTrazabilidad[]>([]);
  const [necesidades, setNecesidades] = useState<NecesidadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [despachosData, necesidadesData] = await Promise.all([
        logisticaService.obtenerTodosLosDespachos(),
        necesidadesService.obtenerTodas()
      ]);
      setDespachos(despachosData);
      setNecesidades(necesidadesData);
    } catch (error) {
      console.error("Error cargando despachos:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerNombreEmergencia = (idNecesidad: string) => {
    const emergencia = necesidades.find(n => n.id === idNecesidad || n.id.toString() === idNecesidad);
    return emergencia ? emergencia.tituloEmergencia : 'Emergencia Desconocida';
  };

  const handleAvanzarEstado = async (despacho: DespachoTrazabilidad) => {
    setProcesandoId(despacho.id);
    
    // Lógica simple de máquina de estados
    let nuevoEstado = '';
    if (despacho.estado === 'PREPARANDO') nuevoEstado = 'EN_TRANSITO';
    else if (despacho.estado === 'EN_TRANSITO') nuevoEstado = 'ENTREGADO';
    else return; // Si ya está entregado, no hace nada

    try {
      await logisticaService.actualizarEstadoDespacho(despacho.id, nuevoEstado);
      
      // Actualizamos la UI sin recargar la página
      setDespachos(despachos.map(d => 
        d.id === despacho.id ? { ...d, estado: nuevoEstado } : d
      ));

      if (nuevoEstado === 'ENTREGADO') {
        alert("¡Camión Entregado! Se ha notificado automáticamente a ms-necesidades para sumar el stock.");
      }

    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Hubo un error al cambiar el estado del despacho.");
    } finally {
      setProcesandoId(null);
    }
  };

  const formatearFecha = (fechaString: string) => {
    if (!fechaString) return 'Fecha no registrada';
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-indigo-600 font-bold">Cargando flota de camiones...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-indigo-900">Control Despachos</h2>
        <p className="text-gray-500 mt-1">Supervisa los camiones en ruta y confirma sus entregas en la zona cero.</p>
      </div>

      {despachos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No hay historial de despachos registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {despachos.map((despacho) => (
            <div key={despacho.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              
              {/* CABECERA DE LA TARJETA */}
              <div className={`p-4 flex justify-between items-center text-white ${
                despacho.estado === 'ENTREGADO' ? 'bg-green-600' : 
                despacho.estado === 'EN_TRANSITO' ? 'bg-blue-600' : 'bg-orange-500'
              }`}>
                <div className="font-bold">
                  Camión: {despacho.patenteVehiculo || 'SIN PATENTE'}
                </div>
                <div className="text-xs font-black tracking-widest px-3 py-1 bg-black/20 rounded-full">
                  {despacho.estado}
                </div>
              </div>

              {/* CUERPO DE LA TARJETA */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Origen (Bodega)</p>
                    <p className="font-semibold text-gray-800">{despacho.centroOrigen?.nombre || 'Desconocido'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Destino (Emergencia)</p>
                    <p className="font-semibold text-red-700">{obtenerNombreEmergencia(despacho.idNecesidadDestino)}</p>
                  </div>
                </div>

                <div className="mb-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">Carga Transportada</p>
                  <div className="flex flex-wrap gap-2">
                    {despacho.items?.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md">
                        {item.cantidad}x {item.categoria}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-4">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Fecha de Salida</p>
                    <p className="text-sm font-medium text-gray-600">{formatearFecha(despacho.fechaSalida)}</p>
                  </div>
                  
                  {/* BOTÓN DE ACCIÓN (MÁQUINA DE ESTADOS) */}
                  {despacho.estado !== 'ENTREGADO' && (
                    <button
                      onClick={() => handleAvanzarEstado(despacho)}
                      disabled={procesandoId === despacho.id}
                      className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition ${
                        procesandoId === despacho.id ? 'bg-gray-200 text-gray-500 cursor-wait' :
                        despacho.estado === 'PREPARANDO' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' :
                        'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {procesandoId === despacho.id ? 'Procesando...' : 
                       despacho.estado === 'PREPARANDO' ? 'Marcar En Tránsito' : 
                       'Confirmar Entrega'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}