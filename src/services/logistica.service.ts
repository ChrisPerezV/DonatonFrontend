import api from '../lib/axios';
import { Comuna } from '../types/necesidades.types';

export interface NuevoCentroRequest {
  nombre: string;
  direccion: string;
  idComuna: number;
}

export interface CentroAcopio {
  id: string;
  nombre: string;
  direccion: string;
  idComuna: number;
  estado: string;
}

export interface ItemInventario {
  id: number;
  idCentroAcopio: string;
  categoria: string;
  unidadMedida: string;
  cantidad: number;
}

export interface ItemDespachoRequest {
  categoria: string;
  cantidad: number;
}

export interface DespachoRequest {
  idCentroOrigen: string;
  idNecesidadDestino: string;
  patenteVehiculo: string;
  items: ItemDespachoRequest[];
}

export interface ItemDespacho {
  id: string;
  categoria: string;
  cantidad: number;
}

export interface DespachoTrazabilidad {
  id: string;
  idNecesidadDestino: string;
  centroOrigen: CentroAcopio;
  estado: string;
  fechaSalida: string;
  patenteVehiculo: string;
  items: ItemDespacho[];
}

export const logisticaService = {
  obtenerComunas: async (): Promise<Comuna[]> => {
    const response = await api.get('/logistica/comunas');
    return response.data;
  },

  crearCentroAcopio: async (centro: NuevoCentroRequest) => {
    const response = await api.post('/logistica/centros-acopio', centro);
    return response.data;
  },

  obtenerTodosLosCentros: async (): Promise<CentroAcopio[]> => {
    const response = await api.get('/logistica/centros-acopio');
    return response.data;
  },

  // 2. AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA (La que causa el error)
  obtenerInventarioPorCentro: async (idCentro: string): Promise<ItemInventario[]> => {
    const response = await api.get(`/logistica/inventario/centro/${idCentro}`);
    return response.data;
  },

  crearDespacho: async (despacho: DespachoRequest) => {
    const response = await api.post('/logistica/despachos', despacho);
    return response.data;
  },

  cambiarEstadoCentro: async (idCentro: string, nuevoEstado: string) => {
    const response = await api.put(`/logistica/centros-acopio/${idCentro}/estado?estado=${nuevoEstado}`);
    return response.data;
  },

  obtenerTodosLosDespachos: async (): Promise<DespachoTrazabilidad[]> => {
    const response = await api.get('/logistica/despachos');
    return response.data;
  },

  actualizarEstadoDespacho: async (idDespacho: string, nuevoEstado: string) => {
    const response = await api.put(`/logistica/despachos/${idDespacho}/estado?nuevoEstado=${nuevoEstado}`);
    return response.data;
  }
};