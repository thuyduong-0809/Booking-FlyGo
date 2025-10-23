import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { CreateSeatAllocationDto } from 'src/seat-allocations/dto/seat-allocation.dto';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class SeatAllocationsService {
  constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,

    @InjectRepository(SeatAllocation)
    private seatAllocationRepository: Repository<SeatAllocation>, 
    
    @InjectRepository(BookingFlight)
    private bookingFlightRepository: Repository<BookingFlight>,

    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,

    
    ){} 

    
    async findAll():Promise<any>{
        let response = {...common_response}
        try {
            const seatAllocations = await this.seatAllocationRepository.find({
                relations:['seat','passenger','bookingFlight']
            });
     
            response.success = true;
            response.message = ' seatAllocations retrieved successfully';
            response.data = seatAllocations;
          
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving seatAllocations';
        }
        return response;
    }

        async create(createSeatAllocationDto: CreateSeatAllocationDto): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const seat = await this.seatRepository.findOne({ where: { seatId:createSeatAllocationDto.seatId} });
                        if(!seat){
                            response.success = false;
                            response.message = 'Seat not found';
                            return response;
                        }
                        const passenger = await this.passengerRepository.findOneBy({ passengerId:createSeatAllocationDto.passengerId });
                        if (!passenger) {
                            response.success = false;
                            response.message = 'Passenger not found';
                            return response;
                        }
                        const bookingFlight = await this.bookingFlightRepository.findOneBy({ bookingFlightId:createSeatAllocationDto.bookingFlightId });
                        if (!bookingFlight ) {
                            response.success = false;
                            response.message = 'bookingFlight not found';
                            return response;
                        }
                        const newSeatAllocation = this.seatAllocationRepository.create({
                            ...createSeatAllocationDto,
                            seat,
                            passenger,
                            bookingFlight 
                        });
                        await this.seatAllocationRepository.save(newSeatAllocation);
                        response.success = true;
                        response.message = 'seatAllocation created successfully';
                        response.data = newSeatAllocation;
                    } catch (error) {
                        response.success = false;
                        response.message = error.message || 'Error while creating seatAllocation';
                    }
                    return response;
                }
            
}
