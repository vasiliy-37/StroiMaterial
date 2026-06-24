import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SiteServicesService } from './site-services.service';
import { CreateSiteServiceDto, UpdateSiteServiceDto } from './dto/site-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('services')
@Controller('services')
export class SiteServicesController {
  constructor(private readonly services: SiteServicesService) {}

  @Get()
  findAll() {
    return this.services.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }
}

@ApiTags('admin/services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/services')
export class AdminSiteServicesController {
  constructor(private readonly services: SiteServicesService) {}

  @Get()
  findAll() {
    return this.services.findAll(false);
  }

  @Post()
  create(@Body() dto: CreateSiteServiceDto) {
    return this.services.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSiteServiceDto) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.services.remove(id);
  }
}
