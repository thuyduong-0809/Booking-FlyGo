import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { AircraftsService } from 'src/aircrafts/aircrafts.service';
import { CreateAircraftDto } from 'src/aircrafts/dto/create-aicrafts.dto';
import { UpdateAircraftDto } from 'src/aircrafts/dto/update-aicrafts.dto';

@Controller('aircrafts')
export class AircraftsController {
    constructor(private aircraftsService: AircraftsService) {}

        @Get()
        findAll() {
            return this.aircraftsService.findAll();
        }
        
        @UsePipes(ValidationPipe)
        @Post()
        create(@Body() createAircraftDto:CreateAircraftDto) {
            return this.aircraftsService.create(createAircraftDto);
        }
    
        @Get(':id')
        findOne(@Param('id') id:string) {
            return this.aircraftsService.findOne(Number(id));
        }
        
        @UsePipes(ValidationPipe)
        @Put(':id')
        update(@Param('id') id:string, @Body() updateAircraftDto:UpdateAircraftDto) {
            return this.aircraftsService.update(Number(id), updateAircraftDto);
        }
    
        @Delete(':id')
        delete(@Param('id') id:string) {
            return this.aircraftsService.delete(Number(id));
        }
}
