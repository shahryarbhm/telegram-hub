import { Module } from '@nestjs/common';
import { SignService } from './sign.service';

@Module({
  providers: [SignService],
  exports: [SignService],
})
export class SignModule { }
