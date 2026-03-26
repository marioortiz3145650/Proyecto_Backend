export class CreateMovimientosInsumoDto {
  fecha: string;
  cantidad: number;
  tipo_movimiento: string;
  observaciones?: string;
  insumo_id: number;
  lote_id: number;
  creado_por: string; // Aquí pegas el UUID de tu usuario
}