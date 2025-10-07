import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportsController } from 'src/airports/airports.controller';
import { AirportsService } from 'src/airports/airports.service';
import { Airport } from 'src/airports/entities/airports.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Airport])],
    providers:[AirportsService],
    controllers:[AirportsController]
})
export class AirportsModule {
    
}
