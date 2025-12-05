import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CheckInsService } from 'src/check-ins/check-ins.service';
import { CreateCheckInDto } from 'src/check-ins/dto/create-check-in.dto';
import { UpdateCheckInDto } from 'src/check-ins/dto/update-check-in.dto';

@Controller('check-ins')
export class CheckInsController {
    constructor(private  checkInsService: CheckInsService) { }
    
        @Get()
        async findAll(): Promise<any> {
            return this. checkInsService.findAll();
        }

        @Get(':id')
        async findOne(@Param('id')id:string): Promise<any> {
            return this. checkInsService.findOne(Number(id))
        }

        @UsePipes(ValidationPipe)
        @Post()
        async create(@Body() createCheckInDto: CreateCheckInDto): Promise<any> {
            return this. checkInsService.createCheckinAirport(createCheckInDto);
        }

        // @UsePipes(ValidationPipe)
        // @Post('online')
        // async createOnline(@Body() createCheckInDto: CreateCheckInDto): Promise<any> {
        //     return this. checkInsService.createOnlineCheckin(createCheckInDto);
        // }


        @UsePipes(ValidationPipe)
        @Put(':id')
        async update(@Param('id')id:string,@Body() updateCheckInDto: UpdateCheckInDto): Promise<any> {
            return this. checkInsService.update(Number(id),updateCheckInDto);
        }

        
        @Delete(':id')
        async delete(@Param('id')id:string): Promise<any> {
            return this.checkInsService.delete(Number(id))
        }

        @Post('by-booking')
        createCheckinByBooking(@Body('bookingReference') bookingReference: string) {
        return this.checkInsService.createOnlineCheckinByBookingReference(bookingReference);
        }
    
}
