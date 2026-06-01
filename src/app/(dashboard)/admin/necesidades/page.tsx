'use client';

import { useState, useEffect } from 'react';
import { necesidadesService } from '@/services/necesidades.service';
import { NecesidadResponse, ItemNecesidad } from '@/types/necesidades.types';

export default function MonitoreoNecesidadesPage() {
  const [necesidades, setNecesidades] = useState<NecesidadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  // --- NUEVOS ESTADOS PARA EL BUSCADOR Y FILTROS ---
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await necesidadesService.obtenerTodas();
      setNecesidades(data);
    } catch (err) {
      console.error("Error al cargar necesidades:", err);
      setError("No se pudo cargar el listado de emergencias.");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN PARA CAMBIAR EL ESTADO ---
  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`)) return;
    
    setProcesandoId(id);
    try {
      await necesidadesService.cambiarEstado(id, nuevoEstado);
      // Actualizamos la UI al instante
      setNecesidades(necesidades.map(n => 
        n.id === id ? { ...n, estado: nuevoEstado } : n
      ));
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Hubo un error al cambiar el estado de la emergencia.");
    } finally {
      setProcesandoId(null);
    }
  };

  const calcularProgresoItem = (cubierto: number = 0, requerido: number = 1) => {
    const porcentaje = (cubierto / requerido) * 100;
    return Math.min(Math.round(porcentaje), 100);
  };

  const calcularProgresoTotal = (items: ItemNecesidad[] = []) => { 
    if (items.length === 0) return 0;
    let totalRequerido = 0;
    let totalCubierto = 0;
    
    items.forEach(item => {
      totalRequerido += item.cantidadRequerida;
      totalCubierto += (item.cantidadCubierta || 0);
    });

    if (totalRequerido === 0) return 0;
    return Math.min(Math.round((totalCubierto / totalRequerido) * 100), 100);
  };

  const formatearTexto = (texto: string) => {
    if (!texto) return '';
    return texto.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // --- LÓGICA DE FILTRADO (BUSCADOR MÁGICO) ---
  const necesidadesFiltradas = necesidades.filter((necesidad) => {
    // 1. Filtro por texto (Busca en título o dirección)
    const coincideTexto = 
      necesidad.tituloEmergencia.toLowerCase().includes(busqueda.toLowerCase()) ||
      (necesidad.direccionEspecifica && necesidad.direccionEspecifica.toLowerCase().includes(busqueda.toLowerCase()));
    
    // 2. Filtro por estado
    const coincideEstado = filtroEstado === 'TODAS' || necesidad.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  if (loading) return <div className="p-8 text-center text-red-600 font-bold animate-pulse">Cargando Zonas de Emergencia...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6">
      
      {/* HEADER PRINCIPAL */}
      <div className="mb-6 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-red-900">Monitoreo de Emergencias</h2>
          <p className="text-gray-500 mt-1">Sigue en tiempo real el progreso de ayuda para cada zona afectada.</p>
        </div>
      </div>

      {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre de emergencia o dirección..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium text-gray-700 bg-gray-50"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODAS">Todos los Estados</option>
            <option value="ACTIVA">Solo Activas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="INACTIVA">Inactivas / Canceladas</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">{error}</div>
      )}

      {/* RENDERIZADO CONDICIONAL DE RESULTADOS */}
      {necesidadesFiltradas.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No se encontraron emergencias que coincidan con tu búsqueda.</p>
          <button onClick={() => { setBusqueda(''); setFiltroEstado('TODAS'); }} className="mt-4 text-red-600 hover:underline font-bold text-sm">
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {necesidadesFiltradas.map((necesidad) => {
            const progresoTotal = calcularProgresoTotal(necesidad.items);
            
            return (
              <div key={necesidad.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
                
                {/* CABECERA DE LA TARJETA */}
                <div className="p-6 border-b border-gray-100 bg-gray-50 relative">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-xl font-bold text-gray-800">{necesidad.tituloEmergencia}</h3>
                    
                    {/* SELECTOR DE ESTADO INTERACTIVO */}
                    <select
                      disabled={procesandoId === necesidad.id}
                      className={`text-xs font-bold tracking-wide px-2 py-1 rounded-md border outline-none cursor-pointer ${
                        procesandoId === necesidad.id ? 'opacity-50 cursor-wait' :
                        necesidad.estado === 'ACTIVA' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                        necesidad.estado === 'COMPLETADA' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                      }`}
                      value={necesidad.estado}
                      onChange={(e) => handleCambiarEstado(necesidad.id, e.target.value)}
                    >
                      <option value="ACTIVA">ACTIVA</option>
                      <option value="COMPLETADA">COMPLETADA</option>
                      <option value="INACTIVA">INACTIVA</option>
                    </select>

                  </div>
                  <p className="text-sm text-gray-500 mb-4">📍 {necesidad.direccionEspecifica || 'Dirección no especificada'}</p>

                  {/* BARRA DE PROGRESO GLOBAL */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-600 uppercase">Progreso General</span>
                      <span className={progresoTotal >= 100 ? 'text-green-600' : 'text-red-600'}>{progresoTotal}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-1000 ${progresoTotal >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${progresoTotal}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* CUERPO - LISTA DE RECURSOS */}
                <div className="p-6 flex-1 bg-white">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recursos Solicitados</h4>
                  
                  <div className="space-y-5">
                    {necesidad.items?.map((item, idx) => {
                      const porcentajeItem = calcularProgresoItem(item.cantidadCubierta, item.cantidadRequerida);
                      const completado = porcentajeItem >= 100;

                      return (
                        <div key={idx} className="relative">
                          <div className="flex justify-between items-end mb-1">
                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                {formatearTexto(item.categoria)}
                                {item.estado === 'CUBIERTO' && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">CUBIERTO</span>}
                              </p>
                              <p className="text-xs text-gray-500">
                                Meta: {item.cantidadRequerida} {formatearTexto(item.unidadMedida)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${completado ? 'text-green-600' : 'text-gray-700'}`}>
                                {item.cantidadCubierta || 0} / {item.cantidadRequerida}
                              </p>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-700 ${completado ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${porcentajeItem}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}