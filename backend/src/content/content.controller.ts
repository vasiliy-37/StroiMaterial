import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ContentService } from './content.service';
import { BulkContentDto, UpdateContentDto, UpdateHeroDto } from './dto/content.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('hero')
  getHero() {
    return this.content.getHeroImage().then((heroImage) => ({ heroImage }));
  }
}

@ApiTags('admin/content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/content')
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  getAll() {
    return Promise.all([
      this.content.getAllContent(),
      this.content.getHeroImage(),
    ]).then(([texts, heroImage]) => ({ ...texts, heroImage }));
  }

  @Patch('entry')
  updateEntry(@Body() dto: UpdateContentDto) {
    return this.content.updateEntry(dto);
  }

  @Post('bulk')
  bulkUpdate(@Body() dto: BulkContentDto) {
    return this.content.bulkUpdate(dto);
  }

  @Patch('hero')
  updateHero(@Body() dto: UpdateHeroDto) {
    return this.content.setHeroImage(dto);
  }
}
