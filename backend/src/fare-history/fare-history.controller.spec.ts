import { Test, TestingModule } from '@nestjs/testing';
import { FareHistoryController } from './fare-history.controller';

describe('FareHistoryController', () => {
  let controller: FareHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FareHistoryController],
    }).compile();

    controller = module.get<FareHistoryController>(FareHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
