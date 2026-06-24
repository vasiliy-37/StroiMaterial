import { Module } from '@nestjs/common';
import { SiteServicesService } from './site-services.service';
import {
  SiteServicesController,
  AdminSiteServicesController,
} from './site-services.controller';

@Module({
  controllers: [SiteServicesController, AdminSiteServicesController],
  providers: [SiteServicesService],
  exports: [SiteServicesService],
})
export class SiteServicesModule {}
