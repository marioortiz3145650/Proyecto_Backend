import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Produccion } from '../produccion/entities/produccion.entity';
import { isUuid } from '../common/utils/uuid.util';
import { Lote } from '../lotes/entities/lote.entity';
import { Muerte } from '../muertes/entities/muerte.entity';
import { MovimientosInsumo } from '../movimientos_insumo/entities/movimientos_insumo.entity';

export interface ReporteProduccionQuery {
  fecha_inicio?: string;
  fecha_fin?: string;
  lote_id?: string;
}

export interface ReporteResumenQuery extends ReporteProduccionQuery {}

export interface ProduccionDia {
  fecha: string;
  total: number;
  jumbo: number;
  aaa: number;
  aa: number;
  a: number;
  b: number;
  c: number;
}

export interface LoteResumen {
  id_lote: number;
  raza: string;
  gallinas: number;
  produccion: number;
  mortalidad: number;
  consumo: number;
}

export interface ReporteResumen {
  totalProduccion: number;
  promedioDiario: number;
  totalConsumoAlimento: number;
  totalMuerte: number;
  tasaMortalidad: number;
  produccionPorDia: ProduccionDia[];
  mortalidadPorCausa: { causa: string; cantidad: number }[];
  resumenLotes: LoteResumen[];
}

function aplicarFiltroFecha(qb: any, alias: string, fechaInicio?: string, fechaFin?: string) {
  if (fechaInicio && fechaFin) {
    qb.andWhere(`${alias} BETWEEN :inicio AND :fin`, { inicio: fechaInicio, fin: fechaFin });
  } else if (fechaInicio) {
    qb.andWhere(`${alias} >= :inicio`, { inicio: fechaInicio });
  } else if (fechaFin) {
    qb.andWhere(`${alias} <= :fin`, { fin: fechaFin });
  }
}

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Produccion)
    private produccionRepo: Repository<Produccion>,
    @InjectRepository(Lote)
    private loteRepo: Repository<Lote>,
    @InjectRepository(Muerte)
    private muerteRepo: Repository<Muerte>,
    @InjectRepository(MovimientosInsumo)
    private movimientoRepo: Repository<MovimientosInsumo>,
  ) {}

  async getResumen(query: ReporteResumenQuery): Promise<ReporteResumen> {
    const pqb = this.produccionRepo.createQueryBuilder('p');
    pqb.leftJoinAndSelect('p.lote', 'lote');
    pqb.leftJoinAndSelect('p.creado_por', 'creado_por');
    aplicarFiltroFecha(pqb, 'p.fecha', query.fecha_inicio, query.fecha_fin);
    if (query.lote_id) {
      if (isUuid(query.lote_id)) {
        pqb.andWhere('lote.uuid = :loteId', { loteId: query.lote_id });
      } else {
        pqb.andWhere('lote.id_lote = :loteId', { loteId: parseInt(query.lote_id, 10) });
      }
    }
    const produccionesFiltradas = await pqb.getMany();

    const mqb = this.muerteRepo.createQueryBuilder('m');
    mqb.leftJoinAndSelect('m.lote', 'lote');
    aplicarFiltroFecha(mqb, 'm.fecha', query.fecha_inicio, query.fecha_fin);
    if (query.lote_id) {
      if (isUuid(query.lote_id)) {
        mqb.andWhere('lote.uuid = :loteId', { loteId: query.lote_id });
      } else {
        mqb.andWhere('lote.id_lote = :loteId', { loteId: parseInt(query.lote_id, 10) });
      }
    }
    const muertesFiltradas = await mqb.getMany();

    const mvqb = this.movimientoRepo.createQueryBuilder('mv');
    mvqb.leftJoinAndSelect('mv.lote', 'lote');
    mvqb.leftJoinAndSelect('mv.alimento', 'alimento');
    mvqb.andWhere('mv.tipo_movimiento IN (:...types)', { types: ['CONSUMO', 'SALIDA'] });
    aplicarFiltroFecha(mvqb, 'mv.fecha', query.fecha_inicio, query.fecha_fin);
    if (query.lote_id) {
      if (isUuid(query.lote_id)) {
        mvqb.andWhere('lote.uuid = :loteId', { loteId: query.lote_id });
      } else {
        mvqb.andWhere('lote.id_lote = :loteId', { loteId: parseInt(query.lote_id, 10) });
      }
    }
    const movimientosFiltrados = await mvqb.getMany();

    const lotesQuery = this.loteRepo.createQueryBuilder('l');
    lotesQuery.leftJoinAndSelect('l.raza', 'raza');
    if (query.lote_id) {
      if (isUuid(query.lote_id)) {
        lotesQuery.andWhere('l.uuid = :loteId', { loteId: query.lote_id });
      } else {
        lotesQuery.andWhere('l.id_lote = :loteId', { loteId: parseInt(query.lote_id, 10) });
      }
    }
    const lotesFiltrados = await lotesQuery.getMany();

    const fechaInicio = query.fecha_inicio ? new Date(query.fecha_inicio) : null;
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : null;

    let totalProd = 0;
    let jumbo = 0;
    let aaa = 0;
    let aa = 0;
    let a = 0;
    let b = 0;
    let c = 0;

    produccionesFiltradas.forEach(p => {
      totalProd += p.total || 0;
      jumbo += p.jumbo || 0;
      aaa += p.aaa || 0;
      aa += p.aa || 0;
      a += p.a || 0;
      b += p.b || 0;
      c += p.c || 0;
    });

    let totalConsumo = 0;
    movimientosFiltrados.forEach(m => {
      totalConsumo += Number(m.cantidad || 0);
    });

    let totalMuertes = 0;
    muertesFiltradas.forEach(m => {
      totalMuertes += Number(m.cantidad || 0);
    });

    const agrupadoDia: Record<string, ProduccionDia> = {};
    produccionesFiltradas.forEach(p => {
      const fechaStr = new Date(p.fecha).toISOString().substring(0, 10);
      if (!agrupadoDia[fechaStr]) {
        agrupadoDia[fechaStr] = { fecha: fechaStr, total: 0, jumbo: 0, aaa: 0, aa: 0, a: 0, b: 0, c: 0 };
      }
      const day = agrupadoDia[fechaStr];
      day.total += p.total || 0;
      day.jumbo += p.jumbo || 0;
      day.aaa += p.aaa || 0;
      day.aa += p.aa || 0;
      day.a += p.a || 0;
      day.b += p.b || 0;
      day.c += p.c || 0;
    });
    const produccionPorDia = Object.keys(agrupadoDia).sort().map(fecha => agrupadoDia[fecha]);

    const agrupadoCausa: Record<string, number> = {};
    muertesFiltradas.forEach(m => {
      const causa = m.causa || 'No especificada';
      agrupadoCausa[causa] = (agrupadoCausa[causa] || 0) + Number(m.cantidad || 0);
    });
    const mortalidadPorCausa = Object.keys(agrupadoCausa).map(causa => ({ causa, cantidad: agrupadoCausa[causa] }));

    const resumenLotes = lotesFiltrados.map(l => {
      const uuid = l.uuid;
      const prodLote = produccionesFiltradas.filter(p => p.lote?.uuid === uuid).reduce((sum, p) => sum + (p.total || 0), 0);
      const muertLote = muertesFiltradas.filter(m => m.lote?.uuid === uuid).reduce((sum, m) => sum + Number(m.cantidad || 0), 0);
      const consLote = movimientosFiltrados.filter(m => m.lote?.uuid === uuid).reduce((sum, m) => sum + Number(m.cantidad || 0), 0);

      return {
        id_lote: l.id_lote,
        raza: l.raza?.nombre_raza || 'N/A',
        gallinas: l.total_gallinas || 0,
        produccion: prodLote,
        mortalidad: muertLote,
        consumo: consLote,
      };
    });

    const totalGallinas = lotesFiltrados.reduce((sum, l) => sum + Number(l.total_gallinas || 0), 0);
    const promedioDiario = fechaInicio && fechaFin
      ? Math.round(totalProd / Math.max(1, Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))))
      : totalProd;

    return {
      totalProduccion: totalProd,
      promedioDiario,
      totalConsumoAlimento: totalConsumo,
      totalMuerte: totalMuertes,
      tasaMortalidad: totalGallinas > 0 ? Math.round((totalMuertes / totalGallinas) * 10000) / 100 : 0,
      produccionPorDia,
      mortalidadPorCausa,
      resumenLotes,
    };
  }
}
