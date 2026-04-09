export class CreateLoteCierreDto {
  lote_id: number;
  galpon_id: number;
  fecha_cierre: string;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_inicial: number;
  cantidad_final: number;
  mortalidad_total: number;
  mortalidad_porcentaje: number;
  huevos_totales: number;
  promedio_produccion: number;
  semanas_produccion: number;
  alimento_consumido_total: number;
  conversion_alimenticia: number;
  costo_total: number;
  ingresos_totales: number;
  ganancia: number;
  observaciones?: string;
  usuario_cierre_id: number;
}