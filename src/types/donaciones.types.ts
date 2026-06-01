export interface ItemDonacion {
  categoria: 'AGUA' | 'ALIMENTO_NO_PERECIBLE' | 'MEDICAMENTOS' | 'ROPA' | 'HERRAMIENTAS' | 'OTROS'; // ENUMs de tu backend
  descripcionItem: string;
  cantidad: number;
  unidadMedida: 'LITROS' | 'KILOS' | 'UNIDADES'; // ENUMs de tu backend
}

export interface DonacionRequest {
  idDonante: string;
  tipoDonacion: 'ESPECIE' | 'MONETARIA';
  idCentroAcopio: string;
  items: ItemDonacion[];
}

export interface CentroAcopio {
  id: string;
  nombre: string;
  direccion?: string;
  estado?: string;
  idComuna?: string;
}