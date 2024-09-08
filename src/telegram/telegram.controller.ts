import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('telegram')
@ApiTags('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) { }

  @Post('send-message')
  @ApiOperation({ summary: 'Send a message to a Telegram chat' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async sendMessage(@Body() body: SendMessageDto) {
    // return this.telegramService.sendMessage(body.chatId, body.text);
  }
}
