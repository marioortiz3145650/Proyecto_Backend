import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Galpon } from './entities/galpone.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { CreateGalponDto } from './dto/create-galpone.dto';
import { UpdateGalponDto } from './dto/update-galpone.dto';
import { FilterGalponDto } from './dto/filter-galpon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class GalponesService {
  constructor(
    @InjectRepository(Galpon)
    private galponRepository: Repository<Galpon>,
    @InjectRepository(Lote)
    private loteRepository: Repository<Lote>,
  ) {}

    async create(createGalponDto: CreateGalponDto) {
    if (createGalponDto.lote) {
      const loteWhere = isUuid(String(createGalponDto.lote)) ? { uuid: String(createGalponDto.lote) } : { id_lote: parseInt(String(createGalponDto.lote), 10) };
      const lote = await this.loteRepository.findOne({
        where: loteWhere
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${createGalponDto.lote} no encontrado`);
      }

      const galpon = this.galponRepository.create({
        nombre: createGalponDto.nombre,
        direccion: createGalponDto.direccion,
        lote,
      });

      return this.galponRepository.save(galpon);
    }

    const galpon = this.galponRepository.create({
      nombre: createGalponDto.nombre,
      direccion: createGalponDto.direccion,
    });

    return this.galponRepository.save(galpon);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterGalponDto,
  ): Promise<PaginatedResponse<Galpon>> {
    const { page = 1, limit = 10, sortBy = 'nombre', order = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Construir where conditions dinámicamente
    const where: any = {};

    if (filterDto) {
      if (filterDto.nombre) {
        where.nombre = Like(`%${filterDto.nombre}%`);
      }
      if (filterDto.direccion) {
        where.direccion = Like(`%${filterDto.direccion}%`);
      }
      if (filterDto.lote) {
        where.lote = isUuid(String(filterDto.lote)) ? { uuid: String(filterDto.lote) } : { id_lote: parseInt(String(filterDto.lote), 10) };
      }
    }

    // Validar campo de ordenamiento
    const validSortFields = ['nombre', 'uuid', 'direccion', 'fecha_creacion'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'nombre';

    const [data, total] = await this.galponRepository.findAndCount({
      where,
      relations: ['lote'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_galpon: parseInt(idOrUuid, 10) };
    const galpon = await this.galponRepository.findOne({
      where,
      relations: ['lote'],
    });

    if (!galpon) {
      throw new NotFoundException(`Galpón con ID/UUID ${idOrUuid} no encontrado`);
    }

    return galpon;
  }

  async findByLote(loteIdOrUuid: string) {
    const loteWhere = isUuid(loteIdOrUuid) ? { uuid: loteIdOrUuid } : { id_lote: parseInt(loteIdOrUuid, 10) };
    return this.galponRepository.find({
      where: { lote: loteWhere },
      relations: ['lote'],
    });
  }

  async update(idOrUuid: string, updateGalponDto: UpdateGalponDto) {
    const galpon = await this.findOne(idOrUuid);

    const updateData: Partial<Galpon> = {};

    if (updateGalponDto.nombre) {
      updateData.nombre = updateGalponDto.nombre;
    }

    if (updateGalponDto.direccion) {
      updateData.direccion = updateGalponDto.direccion;
    }

    // Si viene lote, verificar que existe
    if (updateGalponDto.lote) {
      const loteWhere = isUuid(String(updateGalponDto.lote)) ? { uuid: String(updateGalponDto.lote) } : { id_lote: parseInt(String(updateGalponDto.lote), 10) };
      const lote = await this.loteRepository.findOne({
        where: loteWhere
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${updateGalponDto.lote} no encontrado`);
      }

      updateData.lote = lote; 
    }

    await this.galponRepository.update({ uuid: galpon.uuid }, updateData);
    return this.findOne(galpon.uuid);
  }

  async remove(idOrUuid: string) {
    const galpon = await this.findOne(idOrUuid);
    await this.galponRepository.delete({ uuid: galpon.uuid });
    return { message: `Galpón "${galpon.nombre}" eliminado correctamente` };
  }
}