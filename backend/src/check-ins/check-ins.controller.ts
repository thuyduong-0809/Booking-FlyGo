import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CheckInsService } from 'src/check-ins/check-ins.service';
import { CreateCheckInDto } from 'src/check-ins/dto/create-check-in.dto';

@Controller('check-ins')
export class CheckInsController {
    constructor(private  checkInsService: CheckInsService) { }
    
        @Get()
        async findAll(): Promise<any> {
            return this. checkInsService.findAll();
        }

        @UsePipes(ValidationPipe)
        @Post()
        async create(@Body() createCheckInDto: CreateCheckInDto): Promise<any> {
            return this. checkInsService.create(createCheckInDto);
        }
    
}
