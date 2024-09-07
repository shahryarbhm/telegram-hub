import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiPromise, WsProvider } from '@polkadot/api';  // Polkadot API wrapper used in avail-js-sdk

@Injectable()
export class AvailService {
  private api: ApiPromise;

  constructor(private readonly configService: ConfigService) {
    const wsProvider = new WsProvider(this.configService.get<string>('AVAIL_WS_URL'));
    this.api = new ApiPromise({ provider: wsProvider });
    this.initialize();
  }

  private async initialize() {
    await this.api.isReady;
    console.log('Connected to Avail network');
  }

  async getChainInfo(): Promise<any> {
    return this.api.rpc.system.chain();
  }

  async queryData(query: any): Promise<any> {
    return this.api.query.someModule.someQuery(query);
  }
}
