import { Test, TestingModule } from '@nestjs/testing';
import { SeatAllocationsController } from './seat-allocations.controller';

describe('SeatAllocationsController', () => {
  let controller: SeatAllocationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeatAllocationsController],
    }).compile();

    controller = module.get<SeatAllocationsController>(SeatAllocationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
