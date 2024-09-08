import { Test, TestingModule } from '@nestjs/testing';
import { AvailService } from './avail.service';
import { ConfigService } from '@nestjs/config';
import { ApiPromise, WsProvider } from '@polkadot/api';

jest.mock('@polkadot/api', () => ({
  ApiPromise: jest.fn().mockImplementation(() => ({
    isReady: Promise.resolve(),
    rpc: {
      system: {
        chain: jest.fn().mockResolvedValue('Avail Test Chain'),
      },
    },
    tx: {
      system: {
        remark: jest.fn().mockReturnValue({
          signAndSend: jest.fn().mockResolvedValue('0xtransactionhash'),
        }),
      },
    },
  })),
  WsProvider: jest.fn(),
}));

describe('AvailService', () => {
  let service: AvailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailService, ConfigService],
    }).compile();

    service = module.get<AvailService>(AvailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return chain info', async () => {
    const result = await service.getChainInfo();
    expect(result).toBe('Avail Test Chain');
  });

  it('should submit data to Avail', async () => {
    const result = await service.submitData('Test Data');
    expect(result).toBe('0xtransactionhash');
  });
});
