import { Test, TestingModule } from '@nestjs/testing';
import { BookingFlightsController } from './booking-flights.controller';

describe('BookingFlightsController', () => {
  let controller: BookingFlightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingFlightsController],
    }).compile();

    controller = module.get<BookingFlightsController>(BookingFlightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
