import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateSeatAllocationDto } from 'src/seat-allocations/dto/seat-allocation.dto';
import { SeatAllocationsService } from 'src/seat-allocations/seat-allocations.service';

@Controller('seat-allocations')
export class SeatAllocationsController {
      constructor(private seatAllocationsSevice:SeatAllocationsService){}
    
        @Get()
        async findAll(): Promise<any> {
            return this.seatAllocationsSevice.findAll();
        }

    
        @UsePipes(ValidationPipe)
        @Post()
        async create(@Body() createSeatAllocationDto:CreateSeatAllocationDto): Promise<any> {
            return this.seatAllocationsSevice.create(createSeatAllocationDto);
        }
        
}
