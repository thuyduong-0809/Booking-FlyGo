import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { FlightSeatsService } from 'src/flight-seats/flight-seats.service';

@Controller('flight-seats')
export class FlightSeatsController {
  constructor(private readonly flightSeatsService: FlightSeatsService) { }

  @Get('flight/:flightId')
  async findByFlight(@Param('flightId') flightId: number) {
    return this.flightSeatsService.findByFlight(flightId);
  }

  @Get('flight/:flightId/seat/:seatId')
  async findByFlightAndSeat(
    @Param('flightId') flightId: number,
    @Param('seatId') seatId: number,
  ) {
    return this.flightSeatsService.findByFlightAndSeat(flightId, seatId);
  }

  @Get('flight/:flightId/available/:travelClass')
  async findAvailableSeatsByClass(
    @Param('flightId') flightId: number,
    @Param('travelClass') travelClass: string,
  ) {
    return this.flightSeatsService.findAvailableSeatsByClass(flightId, travelClass);
  }

  @Put('flight/:flightId/seat/:seatId/availability')
  async updateAvailability(
    @Param('flightId') flightId: number,
    @Param('seatId') seatId: number,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.flightSeatsService.updateAvailability(flightId, seatId, isAvailable);
  }

  @Put('seat/:seatId/availability')
  async updateAvailabilityBySeat(
    @Param('seatId') seatId: number,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.flightSeatsService.updateAvailabilityBySeat(seatId, isAvailable);
  }

  @Post('flight/:flightId/generate')
  async generateFlightSeats(@Param('flightId') flightId: number) {
    return this.flightSeatsService.createFlightSeatsForFlight(Number(flightId));
  }

  @Post('reset-auto-increment')
  async resetAutoIncrement() {
    return this.flightSeatsService.resetFlightSeatAutoIncrement();
  }
}

