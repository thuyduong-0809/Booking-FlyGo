import { Test, TestingModule } from '@nestjs/testing';
import { SeatAllocationsService } from './seat-allocations.service';

describe('SeatAllocationsService', () => {
  let service: SeatAllocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeatAllocationsService],
    }).compile();

    service = module.get<SeatAllocationsService>(SeatAllocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
