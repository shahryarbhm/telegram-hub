import { Inject, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;

constructor(@Inject('TELEGRAM_TOKEN') private readonly token: string) {
    console.log(`Telegram token: ${this.token}`);
    this.bot = new TelegramBot(token, { polling: true });
    this.initialize();
  }

  private initialize() {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      console.log(`Received /start command from chat ID: ${chatId}`);
      this.bot.sendMessage(chatId, 'Welcome to Telegram Hub!');
    });
  }

  public sendMessage(chatId: number, text: string) {
    this.bot.sendMessage(chatId, text);
  }
}
