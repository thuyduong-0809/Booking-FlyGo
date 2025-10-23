import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { CreateSeatDto } from 'src/seats/dto/create-seat.dto';
import { Seat } from 'src/seats/entities/seats.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class SeatsService {
    constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,

    @InjectRepository(Aircraft)
    private aircraftRepository: Repository<Aircraft>,      
    ){}


    async findAll():Promise<any>{
        let response = {...common_response}
        try {
            const seats = await this.seatRepository.find({
                relations:['aircraft']
            });
     
            response.success = true;
            response.message = 'seats retrieved successfully';
            response.data = seats;
          
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving seats';
        }
        return response;
    }



    async create(createSeatDto: CreateSeatDto) {
        const { aircraftId, ...seatData } = createSeatDto;
        const aircraft = await this.aircraftRepository.findOne({ where: { aircraftId } });

        if (!aircraft) {
            throw new NotFoundException(`Aircraft with ID ${aircraftId} not found`);
        }

        const seat = this.seatRepository.create({
            ...seatData,
            aircraft,
        });

        return await this.seatRepository.save(seat);
    }


    

}
