import { Test, TestingModule } from '@nestjs/testing';
import { BookingFlightsService } from './booking-flights.service';

describe('BookingFlightsService', () => {
  let service: BookingFlightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingFlightsService],
    }).compile();

    service = module.get<BookingFlightsService>(BookingFlightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
