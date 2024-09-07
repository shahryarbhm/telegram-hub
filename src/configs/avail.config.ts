import { registerAs } from '@nestjs/config';

export default registerAs('avail', () => ({
  wsUrl: process.env.AVAIL_WS_URL,
}));