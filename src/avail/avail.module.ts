import { Module } from '@nestjs/common';
import { AvailService } from './avail.service';
import { AvailController } from './avail.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AvailController],
  providers: [AvailService],
  exports: [AvailService],
})
export class AvailModule {}
  