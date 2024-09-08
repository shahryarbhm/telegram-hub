import { Test, TestingModule } from '@nestjs/testing';
import { LitService } from './lit.service';

describe('LitService', () => {
  let service: LitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LitService],
    }).compile();

    service = module.get<LitService>(LitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
