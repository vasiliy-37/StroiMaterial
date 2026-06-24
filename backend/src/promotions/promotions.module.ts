import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController, AdminPromotionsController } from './promotions.controller';

@Module({
  controllers: [PromotionsController, AdminPromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
