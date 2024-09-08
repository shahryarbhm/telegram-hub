import { Inject, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AvailService } from 'src/avail/avail.service';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private userState = new Map<number, 'waitingForData' | 'idle'>();  // To track user state

  constructor(
    @Inject('TELEGRAM_TOKEN') private readonly token: string,
    private readonly availService: AvailService // Inject AvailService here
  ) {
    console.log(`Telegram token: ${this.token}`);
    this.bot = new TelegramBot(token, { polling: true });
    this.initialize();
  }

  private initialize() {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      console.log(`Received /start command from chat ID: ${chatId}`);
      this.bot.sendMessage(chatId, 'Welcome to Telegram Hub! Use /submit to send data.');
    });

    this.bot.onText(/\/submit/, (msg) => {
      const chatId = msg.chat.id;
      console.log(`Received /submit command from chat ID: ${chatId}`);
      this.userState.set(chatId, 'waitingForData');
      this.bot.sendMessage(chatId, 'Please send the data you want to submit.');
    });

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (this.userState.get(chatId) === 'waitingForData') {
        const dataToSubmit = msg.text;
        if (dataToSubmit) {
          this.userState.set(chatId, 'idle');
          try {
            await this.submitDataToAvail(dataToSubmit);
            this.bot.sendMessage(chatId, 'Data has been successfully submitted to Avail!');
          } catch (error) {
            this.bot.sendMessage(chatId, 'Failed to submit data. Please try again.');
          }
        }
      }
    });
    this.bot.onText(/\/getdata (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const transactionHash = match[1]; // Extracted transaction hash from the command

      try {
        // Use AvailService to retrieve data from the Avail network
        const data = await this.availService.retrieveData(transactionHash);

        // Send the retrieved data to the user
        this.sendMessage(chatId, `Data for transaction ${transactionHash}: ${data}`);
      } catch (error) {
        // Send error message to the user if data could not be retrieved
        this.sendMessage(chatId, `Failed to retrieve data for transaction ${transactionHash}.`);
      }
    });
  }

  private async submitDataToAvail(data: string): Promise<void> {
    // Implement your Avail data submission logic here
    // You can call your AvailService or directly interact with Avail network
    try {
      await this.availService.submitData(data);
      console.log(`Data submitted to Avail: ${data}`);
    }
    catch (error) {
      console.error('Failed to submit data to Avail:', error);
      throw new Error('Data submission failed');
    }
  }
  public sendMessage(chatId: number, text: string) {
    this.bot.sendMessage(chatId, text);
  }
}
