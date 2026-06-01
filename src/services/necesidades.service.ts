import api from '../lib/axios';
import { NecesidadRequest, Comuna, NecesidadResponse } from '../types/necesidades.types';

export const necesidadesService = {
  crearNecesidad: async (necesidad: NecesidadRequest) => {
    const response = await api.post('/necesidades', necesidad);
    return response.data;
  },

  obtenerTodas: async (): Promise<NecesidadResponse[]> => {
    const response = await api.get('/necesidades');
    return response.data;
  },

  cambiarEstado: async (idNecesidad: string, nuevoEstado: string) => {
    const response = await api.put(`/necesidades/${idNecesidad}/estado?nuevoEstado=${nuevoEstado}`);
    return response.data;
  },

  obtenerComunas: async (): Promise<Comuna[]> => {
    const response = await api.get('/logistica/comunas');
    return response.data;
  }
};