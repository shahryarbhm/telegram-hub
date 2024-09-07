import { Test, TestingModule } from '@nestjs/testing';
import { AvailController } from './avail.controller';

describe('AvailController', () => {
  let controller: AvailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailController],
    }).compile();

    controller = module.get<AvailController>(AvailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
