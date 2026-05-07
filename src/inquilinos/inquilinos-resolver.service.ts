import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquilino } from './entities/inquilino.entity';

@Injectable()
export class InquilinosResolverService {
  constructor(
    @InjectRepository(Inquilino)
    private inquilinoRepository: Repository<Inquilino>,
  ) {}

  async resolverInquilino(inquilinoId: string): Promise<Inquilino | null> {
    if (!inquilinoId) return null;
    return this.inquilinoRepository.findOne({ where: { id: inquilinoId } });
  }

  async validarAccesoInquilino(usuarioInquilinoId: string, recursoInquilinoId: string): Promise<boolean> {
    return usuarioInquilinoId === recursoInquilinoId;
  }
}