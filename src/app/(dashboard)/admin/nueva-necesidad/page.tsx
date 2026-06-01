'use client';

import { useState, useEffect } from 'react';
import { necesidadesService } from '@/services/necesidades.service';
import { NecesidadRequest, Comuna } from '@/types/necesidades.types';
import Cookies from 'js-cookie';

export default function NuevaNecesidadPage() {
  const [loading, setLoading] = useState(false);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const itemPorDefecto = {
    categoria: 'AGUA' as const,
    descripcionItem: '',
    cantidadRequerida: 1,
    unidadMedida: 'LITROS' as const,
    prioridad: 'ALTA_URGENCIA' as const
  };

  const [formData, setFormData] = useState<NecesidadRequest>({
    idUsuarioCreador: '',
    tituloEmergencia: '',
    idComuna: 0,
    direccionEspecifica: '',
    items: [ { ...itemPorDefecto } ]
  });

  useEffect(() => {
    const idGuardado = Cookies.get('idUsuario');
    if (idGuardado) {
      setFormData(prev => ({ ...prev, idUsuarioCreador: idGuardado }));
    }
    const cargarComunas = async () => {
      const datosComunas = await necesidadesService.obtenerComunas();
      setComunas(datosComunas);
      if (datosComunas.length > 0) {
        setFormData(prev => ({ ...prev, idComuna: datosComunas[0].id }));
      }
    };
    cargarComunas();
  }, []);

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
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      await necesidadesService.crearNecesidad(formData);
      setMensaje({ texto: '¡Emergencia y necesidades registradas con éxito!', tipo: 'exito' });
      
      // Limpiar formulario tras éxito
      setFormData({
        ...formData,
        tituloEmergencia: '',
        direccionEspecifica: '',
        items: [ { ...itemPorDefecto } ]
      });
      window.scrollTo(0, 0); // Sube la pantalla para ver el mensaje de éxito
    } catch (error: any) {
      // Analizamos la respuesta de error de Spring Boot
      const data = error.response?.data;
      let textoError = 'Error al procesar la necesidad en el servidor.';

      if (data) {
        // A veces Spring envía un texto simple
        if (typeof data === 'string') {
          textoError = data;
        } 
        // A veces envía un objeto con una propiedad "message"
        else if (data.message) {
          textoError = data.message;
        } 
        // Cuando falla el @Valid, Spring Boot suele enviar un mapa de errores
        // Ej: { "tituloEmergencia": "el tamaño debe estar entre 5 y 100" }
        else if (typeof data === 'object') {
          const mensajesValidacion = Object.values(data).join(' | ');
          if (mensajesValidacion) {
            textoError = `Verifica los datos: ${mensajesValidacion}`;
          }
        }
      }

      setMensaje({ texto: textoError, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-6">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-3xl font-bold text-red-800">Declarar Emergencia y Necesidad</h2>
        <p className="text-gray-500 mt-1">Registra los elementos críticos requeridos en la zona afectada.</p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- DATOS GENERALES DE LA EMERGENCIA --- */}
        <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
          <h3 className="text-lg font-bold text-red-900 mb-4">Ubicación y Detalle de la Emergencia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título de la Emergencia</label>
              <input
                type="text"
                required
                minLength={5}
                placeholder="Ej. Inundación en sector sur"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.tituloEmergencia}
                onChange={(e) => setFormData({ ...formData, tituloEmergencia: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna Afectada</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                value={formData.idComuna}
                onChange={(e) => setFormData({ ...formData, idComuna: parseInt(e.target.value) })}
              >
                {comunas.map((comuna) => (
                  <option key={comuna.id} value={comuna.id}>{comuna.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección Específica</label>
              <input
                type="text"
                required
                minLength={5}
                placeholder="Ej. Calle los Patos 123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.direccionEspecifica}
                onChange={(e) => setFormData({ ...formData, direccionEspecifica: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* --- LISTA DINÁMICA DE REQUERIMIENTOS --- */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Elementos Requeridos</h3>
          
          <div className="space-y-5">
            {formData.items.map((item, index) => (
              <div key={index} className="relative p-5 border border-gray-200 rounded-xl bg-white shadow-sm transition hover:shadow-md">
                
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                    Requerimiento {index + 1}
                  </span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Fila 1 */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Categoría</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm outline-none"
                      value={item.categoria}
                      onChange={(e) => handleItemChange(index, 'categoria', e.target.value)}
                    >
                      <option value="AGUA">Agua</option>
                      <option value="ALIMENTO_NO_PERECIBLE">Alimento No Perecible</option>
                      <option value="ROPA">Ropa e Indumentaria</option>
                      <option value="HERRAMIENTAS">Herramientas</option>
                      <option value="MEDICAMENTOS">Medicamentos / P. Auxilios</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </div>

                  <div className="md:col-span-8">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Descripción del Elemento</label>
                    <input
                      type="text"
                      required
                      minLength={5}
                      placeholder="Ej. Agua Purificada"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm outline-none"
                      value={item.descripcionItem}
                      onChange={(e) => handleItemChange(index, 'descripcionItem', e.target.value)}
                    />
                  </div>

                  {/* Fila 2 */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cant. Requerida</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm outline-none"
                      value={item.cantidadRequerida}
                      onChange={(e) => handleItemChange(index, 'cantidadRequerida', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Unidad</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm outline-none"
                      value={item.unidadMedida}
                      onChange={(e) => handleItemChange(index, 'unidadMedida', e.target.value)}
                    >
                      <option value="LITROS">Litros (L)</option>
                      <option value="KILOS">Kilos (Kg)</option>
                      <option value="UNIDADES">Unidades (U)</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Prioridad</label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg text-sm outline-none font-semibold ${
                        item.prioridad === 'ALTA_URGENCIA' ? 'border-red-300 text-red-700 bg-red-50' : 
                        item.prioridad === 'MEDIA' ? 'border-orange-300 text-orange-700 bg-orange-50' : 
                        'border-green-300 text-green-700 bg-green-50'
                      }`}
                      value={item.prioridad}
                      onChange={(e) => handleItemChange(index, 'prioridad', e.target.value)}
                    >
                      <option value="ALTA_URGENCIA">Alta Urgencia</option>
                      <option value="MEDIA">Media</option>
                      <option value="BAJA">Baja</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarNuevoItem}
            className="mt-4 w-full border-2 border-dashed border-red-300 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition duration-200"
          >
            + Añadir otro requerimiento a esta emergencia
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg transition duration-200 disabled:bg-gray-400 disabled:shadow-none"
        >
          {loading ? 'Emitiendo Alerta...' : 'Declarar Emergencia Oficial'}
        </button>
      </form>
    </div>
  );
}