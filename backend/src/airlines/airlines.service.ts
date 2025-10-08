import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAirlinesDto } from 'src/airlines/dto/create-airline.dto';
import { Airline } from 'src/airlines/entities/airlines.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class AirlinesService {
    constructor(
        @InjectRepository(Airline) private airlineRepository: Repository<Airline>,
    ) {}

    async findAll(): Promise<any> {
        let response = { ...common_response };
        try {
            const airlines = await this.airlineRepository.find({
                select: [
                    'airlineId',
                    'airlineCode',
                    'airlineName',
                    'logoURL',
                    'contactNumber',
                    'website',
                    'isActive',
                ],
            });

            response.success = true;
            response.data = airlines;
            response.message = 'Successfully retrieved the list of airlines';
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving the list of airlines';
        }
        return response;
    }

    async create(createAirlinesDto: CreateAirlinesDto): Promise<any> {
        let response = { ...common_response };
        try {
            const newAirline = await this.airlineRepository.save(createAirlinesDto);
            response.success = true;
            response.message = 'Airline created successfully';
            response.data = newAirline;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while creating airline';
        }
        return response;
    }

    async findOne(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const airline = await this.airlineRepository.findOneBy({ airlineId: id });
            if (airline) {
                response.success = true;
                response.data = airline;
                response.message = 'Successfully retrieved airline information';
            } else {
                response.success = false;
                response.message = 'Airline not found';
            }
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving airline by ID';
        }
        return response;
    }

    async update(
        id: number,
        updateAirlineDto: Partial<CreateAirlinesDto>,
    ): Promise<any> {
        let response = { ...common_response };
        try {
            const updateResult = await this.airlineRepository.update(id, updateAirlineDto);

            if (updateResult.affected && updateResult.affected > 0) {
                response.success = true;
                response.message = 'Airline updated successfully';
            } else {
                response.success = false;
                response.message = 'Airline not found or no changes made';
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while updating airline';
        }
        return response;
    }

    async delete(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const deleteResult = await this.airlineRepository.delete({ airlineId: id });
            if (deleteResult.affected && deleteResult.affected > 0) {
                response.success = true;
                response.message = 'Airline deleted successfully';
            } else {
                response.success = false;
                response.message = 'Airline not found';
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while deleting airline';
        }
        return response;
    }
}
