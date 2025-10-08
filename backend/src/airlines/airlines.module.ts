import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirlinesController } from 'src/airlines/airlines.controller';
import { AirlinesService } from 'src/airlines/airlines.service';
import { Airline } from 'src/airlines/entities/airlines.entity';

@Module(
    {
        imports:[TypeOrmModule.forFeature([Airline])],
        providers:[AirlinesService],
        controllers:[AirlinesController]
    }
)
export class AirlinesModule {}
