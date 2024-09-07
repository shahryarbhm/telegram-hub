import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    TelegramService,
    {
      provide: 'TELEGRAM_TOKEN',
      useFactory: (configService: ConfigService) => configService.get<string>('telegram.token'),
      inject: [ConfigService],
    },
  ],
  controllers: [TelegramController],
})
export class TelegramModule {}