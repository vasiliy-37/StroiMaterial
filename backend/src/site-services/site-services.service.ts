import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteServiceDto, UpdateSiteServiceDto } from './dto/site-service.dto';
import { toSiteServiceDto } from '../common/mappers/catalog.mapper';

@Injectable()
export class SiteServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    const services = await this.prisma.siteService.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    return services.map(toSiteServiceDto);
  }

  async findOne(id: string, activeOnly = true) {
    const service = await this.prisma.siteService.findFirst({
      where: activeOnly ? { id, active: true } : { id },
    });
    if (!service) throw new NotFoundException('Service not found');
    return toSiteServiceDto(service);
  }

  async create(dto: CreateSiteServiceDto) {
    const service = await this.prisma.siteService.create({ data: dto });
    return toSiteServiceDto(service);
  }

  async update(id: string, dto: UpdateSiteServiceDto) {
    await this.findOne(id, false);
    const service = await this.prisma.siteService.update({ where: { id }, data: dto });
    return toSiteServiceDto(service);
  }

  async remove(id: string) {
    await this.findOne(id, false);
    await this.prisma.siteService.delete({ where: { id } });
    return { ok: true };
  }
}
