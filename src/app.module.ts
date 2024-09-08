import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { AvailModule } from './avail/avail.module';
import { SignModule } from './sign/sign.module';
import { LitModule } from './lit/lit.module';
import telegramConfig from './configs/telegram.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [telegramConfig],
    }),
    TelegramModule,
    AvailModule,
    SignModule,
    LitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}