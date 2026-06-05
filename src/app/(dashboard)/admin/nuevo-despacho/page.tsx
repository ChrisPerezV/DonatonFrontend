'use client';

import { useState, useEffect } from 'react';
import { logisticaService, CentroAcopio, DespachoRequest } from '@/services/logistica.service';
import { necesidadesService } from '@/services/necesidades.service';
import { NecesidadResponse } from '@/types/necesidades.types';

export default function NuevoDespachoPage() {
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [necesidades, setNecesidades] = useState<NecesidadResponse[]>([]);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estado del formulario ajustado a tu Backend
  const [idCentroOrigen, setIdCentroOrigen] = useState('');
  const [idNecesidadDestino, setIdNecesidadDestino] = useState('');
  const [patenteVehiculo, setPatenteVehiculo] = useState('');
  
  // Lista dinámica de ítems a despachar (Sin unidad de medida, como pide tu backend)
  const [items, setItems] = useState([{ categoria: 'AGUA', cantidad: 0 }]);

useEffect(() => {
    const cargarListas = async () => {
      try {
        const [centrosData, necesidadesData] = await Promise.all([
          logisticaService.obtenerTodosLosCentros(),
          necesidadesService.obtenerTodas()
        ]);
        
        // 1. Filtrado ultra seguro para Centros
        if (Array.isArray(centrosData)) {
          const activos = centrosData.filter(c => c?.estado === 'ACTIVO');
          setCentros(activos);
          if (activos.length > 0) setIdCentroOrigen(activos[0].id);
        }

        // 2. Filtrado ultra seguro para Necesidades
        if (Array.isArray(necesidadesData)) {
          // Cambiamos 'ACTIVA' por el estado real que tenga tu backend (puse 'ACTIVA' y 'PENDIENTE' por si acaso)
          const activas = necesidadesData.filter(n => n?.estado === 'ACTIVA' || n?.estado === 'PENDIENTE');
          setNecesidades(activas);
          if (activas.length > 0) setIdNecesidadDestino(activas[0].id?.toString() || '');
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoadingDatos(false);
      }
    };
    cargarListas();
  }, []);

  const agregarItem = () => {
    setItems([...items, { categoria: 'ALIMENTOS', cantidad: 0 }]);
  };

  const actualizarItem = (index: number, campo: string, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setMensaje({ texto: '', tipo: '' });

    // Armamos el JSON exactamente como lo exige tu Postman/Backend
    const payload: DespachoRequest = {
      idCentroOrigen,
      idNecesidadDestino,
      patenteVehiculo,
      items: items.filter(i => i.cantidad > 0)
    };

    try {
      await logisticaService.crearDespacho(payload);
      setMensaje({ texto: '¡Despacho coordinado! El stock ha sido descontado de la bodega.', tipo: 'exito' });
      
      // Resetear formulario tras éxito
      setPatenteVehiculo('');
      setItems([{ categoria: 'AGUA', cantidad: 0 }]);
    } catch (error: any) {
      setMensaje({ 
        texto: error.response?.data?.message || 'Error al procesar el despacho. Verifica que haya stock suficiente en la bodega.', 
        tipo: 'error' 
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingDatos) return <div className="p-8 text-center text-indigo-600 font-bold animate-pulse">Cargando rutas logísticas...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-6">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-3xl font-bold text-indigo-900">Coordinar Despacho</h2>
        <p className="text-gray-500 mt-1">Asigna un vehículo y envía recursos hacia una zona afectada.</p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ORIGEN */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">1. Bodega de Origen</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={idCentroOrigen}
              onChange={(e) => setIdCentroOrigen(e.target.value)}
              required
            >
              {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* DESTINO */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">2. Emergencia Destino</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={idNecesidadDestino}
              onChange={(e) => setIdNecesidadDestino(e.target.value)}
              required
            >
              {necesidades.map(n => <option key={n.id} value={n.id}>{n.tituloEmergencia}</option>)}
            </select>
          </div>
        </div>

        {/* CAMPO NUEVO: PATENTE DEL VEHÍCULO */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">3. Patente del Vehículo</label>
          <input
            type="text"
            required
            placeholder="Ej: AB-CD-12"
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
            value={patenteVehiculo}
            onChange={(e) => setPatenteVehiculo(e.target.value.toUpperCase())}
          />
        </div>

        {/* ÍTEMS A DESPACHAR */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">4. Carga del Camión (Ítems)</label>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none font-medium"
                value={item.categoria}
                onChange={(e) => actualizarItem(index, 'categoria', e.target.value)}
              >
                <option value="AGUA">Agua</option>
                <option value="ALIMENTOS">Alimentos</option>
                <option value="ROPA">Ropa</option>
                <option value="MEDICAMENTOS">Medicamentos</option>
                <option value="HERRAMIENTAS">Herramientas</option>
              </select>

              <input
                type="number"
                min="1"
                placeholder="Cantidad a enviar"
                className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none"
                value={item.cantidad || ''}
                onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value))}
                required
              />

              {items.length > 1 && (
                <button type="button" onClick={() => eliminarItem(index)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={agregarItem}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center mt-2 bg-indigo-50 px-4 py-2 rounded-lg"
          >
            + Añadir otra categoría
          </button>
        </div>

        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full mt-8 bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition duration-200 disabled:bg-gray-400"
        >
          {loadingSubmit ? 'Verificando stock y despachando...' : 'Confirmar Salida del Camión'}
        </button>
      </form>
    </div>
  );
}