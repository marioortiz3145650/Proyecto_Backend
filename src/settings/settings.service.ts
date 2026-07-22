import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly repo: Repository<Setting>,
  ) {}

  async findAll() {
    const settings = await this.repo.find({ order: { key: 'ASC' } });
    const resultado: Record<string, string> = {};
    settings.forEach(s => (resultado[s.key] = s.value));
    return resultado;
  }

  async findOne(key: string) {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting no encontrado');
    return setting;
  }

  async create(dto: CreateSettingDto) {
    const exists = await this.repo.findOne({ where: { key: dto.key } });
    if (exists) throw new BadRequestException('Ya existe un setting con esa clave');
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(key: string, patch: Partial<CreateSettingDto>) {
    const setting = await this.findOne(key);
    Object.assign(setting, patch);
    return this.repo.save(setting);
  }

  async remove(key: string) {
    const setting = await this.findOne(key);
    await this.repo.remove(setting);
    return { message: 'Setting eliminado correctamente' };
  }
}
