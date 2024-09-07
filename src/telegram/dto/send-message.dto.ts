import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'The chat ID to send the message to' })
  chatId: number;

  @ApiProperty({ description: 'The message text to send' })
  text: string;
}
