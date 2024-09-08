import { Module } from '@nestjs/common';
import { AvailService } from './avail.service';
import { AvailController } from './avail.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LitModule } from 'src/lit/lit.module';

@Module({
  imports: [ConfigModule, LitModule],
  controllers: [AvailController],
  providers: [AvailService,
    {
      provide: 'AVAIL_SEED_PHRASE',
      useFactory: (configService: ConfigService) => configService.get<string>('avail.seedPhrase'),
      inject: [ConfigService],
    },
  ],
  exports: [AvailService],
})
export class AvailModule { }
