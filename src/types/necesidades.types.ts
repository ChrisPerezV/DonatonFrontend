export interface ItemNecesidad {
  categoria: 'AGUA' | 'ALIMENTO_NO_PERECIBLE' | 'ROPA' | 'HERRAMIENTAS' | 'MEDICAMENTOS' | 'OTROS';
  descripcionItem: string;
  cantidadRequerida: number;
  cantidadCubierta: number;
  unidadMedida: 'LITROS' | 'KILOS' | 'UNIDADES';
  prioridad: 'ALTA_URGENCIA' | 'MEDIA' | 'BAJA';
  estado?: string;
}

export interface NecesidadRequest {
  idUsuarioCreador: string;
  tituloEmergencia: string;
  idComuna: number;
  direccionEspecifica: string;
  items: ItemNecesidad[];
}

export interface Comuna {
  id: number;
  nombre: string;
}

export interface NecesidadResponse {
  id: string;
  tituloEmergencia: string;
  descripcion?: string;
  estado: string;
  direccionEspecifica?: string;
  items: ItemNecesidad[];
  idComuna: number;
}