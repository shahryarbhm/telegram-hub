import { Injectable, Inject } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { LitService } from 'src/lit/lit.service';
import { AvailService } from 'src/avail/avail.service';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private userState: Map<number, 'waitingForPublicKey' | 'waitingForPrivateKey' | 'waitingForData' | 'waitingForBlock' | 'idle'> = new Map();
  private userKeys: Map<number, { publicKey: string; privateKey: string }> = new Map();

  constructor(
    @Inject('TELEGRAM_BOT_TOKEN') private readonly botToken: string,
    @Inject('TELEGRAM_APP_DOMAIN') private readonly appDomain: string,
    private readonly litService: LitService,
    private readonly availService: AvailService
  ) {
    this.bot = new TelegramBot(this.botToken, { polling: true });
    this.initialize();
  }

  private initialize() {
    // Handle the /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.sendMainMenu(chatId);
    });

    // Handle text messages
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (text === 'Submit Data') {
        this.userState.set(chatId, 'waitingForData');
        this.bot.sendMessage(chatId, 'Please send the data you want to submit.');
      }
      else if (text === 'Retrive Data') {
        this.userState.set(chatId, 'waitingForBlock');
        this.bot.sendMessage(chatId, 'Please send the block hash you want to retrive.');
      }
      else if (text === 'Submit Public Key') {
        this.userState.set(chatId, 'waitingForPublicKey');
        this.bot.sendMessage(chatId, 'Please send your public key.');
      } else if (text === 'Submit Private Key') {
        this.userState.set(chatId, 'waitingForPrivateKey');
        this.bot.sendMessage(chatId, 'Please send your private key.');
      } else if (this.userState.get(chatId) === 'waitingForPublicKey') {
        await this.handlePublicKeySubmission(chatId, text);
      } else if (this.userState.get(chatId) === 'waitingForPrivateKey') {
        await this.handlePrivateKeySubmission(chatId, text);
      } else if (this.userState.get(chatId) === 'waitingForData') {
        await this.handleDataSubmission(chatId, text);
      } else if (this.userState.get(chatId) === 'waitingForBlock') {
        await this.handleRetriveData(chatId, text);
      }
    });
  }

  private async handlePublicKeySubmission(chatId: number, publicKey: string) {
    let userKeys = this.userKeys.get(chatId);
    if (!userKeys) {
      userKeys = { publicKey, privateKey: '' };
    } else {
      userKeys.publicKey = publicKey;
    }
    this.userKeys.set(chatId, userKeys);
    this.userState.set(chatId, 'waitingForPrivateKey');
    this.bot.sendMessage(chatId, 'Public key received. Now please send your private key.');
  }

  private async handlePrivateKeySubmission(chatId: number, privateKey: string) {
    let userKeys = this.userKeys.get(chatId);
    if (!userKeys) {
      userKeys = { publicKey: '', privateKey };
    } else {
      userKeys.privateKey = privateKey;
    }
    this.userKeys.set(chatId, userKeys);
    this.userState.set(chatId, 'waitingForData');
    this.bot.sendMessage(chatId, 'Private key received. You can now submit your data.');
  }

  private async handleDataSubmission(chatId: number, dataToSubmit: string) {
    try {
      const userKeys = this.userKeys.get(chatId);
      if (!userKeys || !userKeys.privateKey || !userKeys.publicKey) {
        throw new Error('Keys not found for user.');
      }

      // Encrypt the data using LitService with the public key
      const encryptedData = await this.litService.encryptData(dataToSubmit, userKeys.publicKey);

      // Submit the encrypted data to Avail
      const transactionHash = await this.availService.submitEncryptedData(encryptedData, userKeys.publicKey);

      // Notify user
      this.bot.sendMessage(chatId, `Data has been successfully submitted to Avail! Transaction Hash: ${transactionHash}`);
    } catch (error) {
      console.error('Failed to handle data submission:', error);
      this.bot.sendMessage(chatId, 'Failed to submit data. Please try again.');
    }
  }
  private async handleRetriveData(chatId: number, blockHash: string) {
    try {
      const userKeys = this.userKeys.get(chatId);


      // Encrypt the data using LitService with the public key
      // const encryptedData = await this.litService.encryptData(dataToSubmit, userKeys.publicKey);
      console.log(blockHash)

      // Submit the encrypted data to Avail
      const transactionHash = await this.availService.retrieveData(blockHash, '')

      console.log(transactionHash)
      // Notify user
      this.bot.sendMessage(chatId, `Data has been successfully submitted to Avail! Transaction Hash: ${transactionHash}`);
    } catch (error) {
      console.error('Failed to handle data submission:', error);
      this.bot.sendMessage(chatId, 'Failed to submit data. Please try again.');
    }
  }

  private sendMainMenu(chatId: number) {
    const options = {
      reply_markup: {
        keyboard: [
          [{ text: 'Submit Data' }],
          [{ text: 'Submit Public Key' }],
          [{ text: 'Submit Private Key' }],
          [{ text: 'Retrive Data' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };
    this.bot.sendMessage(chatId, `Welcome to Telegram Hub! Please choose an option:`, options);
  }
}
