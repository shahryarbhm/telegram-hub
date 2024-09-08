import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AvailService } from './avail.service';

@ApiTags('avail')
@Controller('avail')
export class AvailController {
  constructor(private readonly availService: AvailService) {}

  @Get('chain-info')
  @ApiOperation({ summary: 'Get chain information' })
  async getChainInfo() {
    return this.availService.getChainInfo();
  }

  @Get('query-data')
  @ApiOperation({ summary: 'Query data from Avail' })
  @ApiQuery({ name: 'query', type: String, required: true })
  async queryData(@Query('query') query: string) {
    return this.availService.queryData(query);
  }

  @Post('submit-data')
  @ApiOperation({ summary: 'Submit data to Avail' })
  @ApiBody({ schema: { type: 'object', properties: { data: { type: 'string' } } } })
  async submitData(@Body('data') data: string) {
    return this.availService.submitData(data);
  }
}
