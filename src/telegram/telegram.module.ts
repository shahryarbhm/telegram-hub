import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { AvailModule } from 'src/avail/avail.module';
import { SignModule } from 'src/sign/sign.module';
import { LitModule } from 'src/lit/lit.module';

@Module({
  imports: [ConfigModule, AvailModule, SignModule, LitModule],
  providers: [
    TelegramService,
    {
      provide: 'TELEGRAM_BOT_TOKEN',
      useFactory: (configService: ConfigService) => configService.get<string>('telegram.token'),
      inject: [ConfigService],
    },
    {
      provide: 'TELEGRAM_APP_DOMAIN',
      useFactory: (configService: ConfigService) => configService.get<string>('telegram.domain'),
      inject: [ConfigService],
    },
  ],
  controllers: [TelegramController],
})
export class TelegramModule { }