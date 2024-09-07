import { Test, TestingModule } from '@nestjs/testing';
import { AvailService } from './avail.service';

describe('AvailService', () => {
  let service: AvailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailService],
    }).compile();

    service = module.get<AvailService>(AvailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
