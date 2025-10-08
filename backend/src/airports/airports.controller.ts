import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { AirportsService } from 'src/airports/airports.service';
import { CreateAirportDto } from 'src/airports/dto/create-airport.dto';
import { UpdateAirportDto } from 'src/airports/dto/update-airport.dto';

@Controller('airports')
export class AirportsController {
     constructor(private airportService:AirportsService){}
    
        @Get()
        FindAll(){
            return this.airportService.findAll();
        }
    
        @UsePipes(ValidationPipe)
        @Post()
        create(@Body() createAirportDto:CreateAirportDto){
            return this.airportService.create(createAirportDto);
        }
    
        @Get(':id')
        findOne(@Param('id') id:string){
            return this.airportService.findOne(Number(id));
        }
    
        @UsePipes(ValidationPipe)
        @Put(':id')
        update(@Param('id') id:string, @Body() updateAirportDto:UpdateAirportDto){
            return this.airportService.update(Number(id), updateAirportDto);
        }
    
        @Delete(':id')
        delete(@Param('id') id:string){
            return this.airportService.delete(Number(id));
        }
}
