'use client';

import { useState, useEffect, useMemo } from 'react';
import { donacionesService } from '@/services/donaciones.service';
import { logisticaService } from '@/services/logistica.service'; // <-- Importamos tu servicio real
import { DonacionRequest, CentroAcopio } from '@/types/donaciones.types';
import { Comuna } from '@/types/necesidades.types'; // <-- Importamos tu interfaz real
import Cookies from 'js-cookie';

export default function NuevaDonacionPage() {
  const [loading, setLoading] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(true);
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // --- ESTADOS DE FILTROS ---
  const [busquedaCentro, setBusquedaCentro] = useState('');
  const [filtroComuna, setFiltroComuna] = useState<string>('TODAS');
  const [comunas, setComunas] = useState<Comuna[]>([]); // Usando tu interfaz

  const itemPorDefecto = {
    categoria: 'AGUA' as const,
    descripcionItem: '',
    cantidad: 1,
    unidadMedida: 'LITROS' as const
  };

  const [formData, setFormData] = useState<DonacionRequest>({
    idDonante: '',
    tipoDonacion: 'ESPECIE', 
    idCentroAcopio: '',
    items: [ { ...itemPorDefecto } ]
  });

  useEffect(() => {
    const idGuardado = Cookies.get('idUsuario');
    if (idGuardado) {
      setFormData(prev => ({ ...prev, idDonante: idGuardado }));
    }

    const cargarDatosIniciales = async () => {
      try {
        // Cargar Centros
        const datosCentros = await donacionesService.obtenerCentrosAcopio();
        const centrosActivos = datosCentros.filter(c => c.estado === 'ACTIVO');
        setCentros(centrosActivos);
        
        // Cargar Comunas (Conectado a tu API real)
        const datosComunas = await logisticaService.obtenerComunas();
        setComunas(datosComunas);

      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setLoadingCentros(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  // --- LÓGICA DE FILTRADO DOBLE ---
  const centrosFiltrados = useMemo(() => {
    return centros.filter(c => {
      // 1. Filtro por texto
      const coincideTexto = 
        c.nombre.toLowerCase().includes(busquedaCentro.toLowerCase()) ||
        (c.direccion && c.direccion.toLowerCase().includes(busquedaCentro.toLowerCase()));
      
      // 2. Filtro por Comuna
      const coincideComuna = filtroComuna === 'TODAS' || c.idComuna?.toString() === filtroComuna;

      return coincideTexto && coincideComuna;
    });
  }, [centros, busquedaCentro, filtroComuna]);

  // --- AUTO-SELECCIÓN SEGURA ---
  useEffect(() => {
    if (centrosFiltrados.length > 0) {
      if (!centrosFiltrados.find(c => c.id === formData.idCentroAcopio)) {
        setFormData(prev => ({ ...prev, idCentroAcopio: centrosFiltrados[0].id }));
      }
    } else {
      setFormData(prev => ({ ...prev, idCentroAcopio: '' }));
    }
  }, [centrosFiltrados]);

  // --- FUNCIONES DE ÍTEMS ---
  const handleItemChange = (index: number, field: string, value: any) => {
    const nuevosItems = [...formData.items];
    nuevosItems[index] = { ...nuevosItems[index], [field]: value };
    setFormData({ ...formData, items: nuevosItems });
  };

  const agregarNuevoItem = () => {
    setFormData({ ...formData, items: [...formData.items, { ...itemPorDefecto }] });
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: nuevosItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idCentroAcopio) {
      setMensaje({ texto: 'Por favor, selecciona un centro de acopio válido de la lista.', tipo: 'error' });
      return;
    }

    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      await donacionesService.crearDonacion(formData);
      setMensaje({ texto: '¡Donación registrada con éxito en el sistema!', tipo: 'exito' });
      setFormData({ ...formData, items: [ { ...itemPorDefecto } ] });
      setBusquedaCentro(''); 
    } catch (error: any) {
      setMensaje({ texto: error.response?.data?.message || 'Error al procesar la donación.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Registrar Aporte</h2>
        <p className="text-gray-500 text-sm">Selecciona los ítems que deseas entregar al centro de acopio.</p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN DE CENTRO DE ACOPIO CON FILTROS DOBLES */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="block text-sm font-bold text-gray-800 mb-4">📍 ¿En qué Centro de Acopio entregarás tu aporte?</label>
          
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            
            {/* 1. Selector de Comuna */}
            <div className="md:w-1/3">
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white shadow-sm"
                value={filtroComuna}
                onChange={(e) => setFiltroComuna(e.target.value)}
                disabled={loadingCentros}
              >
                <option value="TODAS">Todas las Comunas</option>
                {comunas.map(comuna => (
                  <option key={comuna.id} value={comuna.id.toString()}>{comuna.nombre}</option>
                ))}
              </select>
            </div>

            {/* 2. Buscador de Texto */}
            <div className="md:w-2/3 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre o calle del centro..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white shadow-sm transition"
                value={busquedaCentro}
                onChange={(e) => setBusquedaCentro(e.target.value)}
                disabled={loadingCentros}
              />
            </div>
          </div>

          {/* Selector Dinámico (Resultados) */}
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 shadow-sm font-medium"
            value={formData.idCentroAcopio}
            onChange={(e) => setFormData({ ...formData, idCentroAcopio: e.target.value })}
            disabled={loadingCentros || centrosFiltrados.length === 0}
            size={centrosFiltrados.length > 0 ? Math.min(centrosFiltrados.length, 4) : 1} 
          >
            {loadingCentros ? (
              <option>Cargando centros de acopio...</option>
            ) : centrosFiltrados.length === 0 ? (
              <option>No se encontraron centros con esos filtros</option>
            ) : (
              centrosFiltrados.map((centro) => (
                <option key={centro.id} value={centro.id} className="py-1">
                  {centro.nombre} - {centro.direccion}
                </option>
              ))
            )}
          </select>
          
          {centrosFiltrados.length > 0 && (
            <p className="text-xs text-gray-500 mt-2 text-right font-medium">Mostrando {centrosFiltrados.length} centro(s) disponible(s)</p>
          )}
        </div>

        {/* --- LISTA DINÁMICA DE ÍTEMS --- */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Detalle de los Bienes</h3>
          </div>
          
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="relative p-5 border border-blue-100 rounded-xl bg-white shadow-sm transition hover:shadow-md">
                
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    Ítem {index + 1}
                  </span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                    >
                      Eliminar Ítem
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Categoría</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                      value={item.categoria}
                      onChange={(e) => handleItemChange(index, 'categoria', e.target.value)}
                    >
                      <option value="AGUA">Agua</option>
                      <option value="ALIMENTO_NO_PERECIBLE">Alimentos No Perecibles</option>
                      <option value="ROPA">Ropa e Indumentaria</option>
                      <option value="HERRAMIENTAS">Herramientas</option>
                      <option value="MEDICAMENTOS">Medicamentos / Primeros Auxilios</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </div>

                  <div className="md:col-span-8">
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Descripción</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pack de 6 botellas de agua"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                      value={item.descripcionItem}
                      onChange={(e) => handleItemChange(index, 'descripcionItem', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Cantidad</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Unidad</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                      value={item.unidadMedida}
                      onChange={(e) => handleItemChange(index, 'unidadMedida', e.target.value)}
                    >
                      <option value="LITROS">Litros (L)</option>
                      <option value="KILOS">Kilos (Kg)</option>
                      <option value="UNIDADES">Unidades (U)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarNuevoItem}
            className="mt-4 w-full border-2 border-dashed border-blue-300 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition duration-200"
          >
            + Añadir otro ítem a esta donación
          </button>
        </div>

        <hr className="border-gray-200" />

        <button
          type="submit"
          disabled={loading || loadingCentros || centrosFiltrados.length === 0}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-200 disabled:bg-gray-400 disabled:shadow-none"
        >
          {loading ? 'Transmitiendo al Servidor...' : 'Confirmar Envío de Donación'}
        </button>
      </form>
    </div>
  );
}