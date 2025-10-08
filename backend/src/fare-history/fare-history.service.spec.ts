import { Test, TestingModule } from '@nestjs/testing';
import { FareHistoryService } from './fare-history.service';

describe('FareHistoryService', () => {
  let service: FareHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FareHistoryService],
    }).compile();

    service = module.get<FareHistoryService>(FareHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
