import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
  webhookDomain: process.env.WEBHOOK_DOMAIN,
  webhookPath: process.env.WEBHOOK_PATH,
}));