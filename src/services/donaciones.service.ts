import api from '../lib/axios';
import { DonacionRequest, CentroAcopio } from '../types/donaciones.types';

export const donacionesService = {
  crearDonacion: async (donacion: DonacionRequest) => {
    const response = await api.post('/donaciones', donacion);
    return response.data;
  },

  obtenerMisDonaciones: async (idDonante: string) => {
    // Asegúrate de que esta ruta coincida con el @GetMapping de tu ms-donaciones
    const response = await api.get(`/donaciones/usuario/${idDonante}`); 
    return response.data;
  },

  obtenerCentrosAcopio: async (): Promise<CentroAcopio[]> => {
    const response = await api.get('/logistica/centros-acopio');
    return response.data;
  }
};