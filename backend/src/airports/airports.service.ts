import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAirportDto } from 'src/airports/dto/create-airport.dto';
import { Airport } from 'src/airports/entities/airports.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class AirportsService {
    constructor(
        @InjectRepository(Airport) private airportRepository: Repository<Airport>,
    ) {}

    async findAll(): Promise<any> {
        let response = { ...common_response };
        try {
            const airports = await this.airportRepository.find({
                select: [
                    'airportId',
                    'airportCode',
                    'airportName',
                    'city',
                    'country',
                    'timezone',
                    'latitude',
                    'longitude',
                ],
            });

            response.success = true;
            response.data = airports;
            response.message = 'Successfully retrieved the list of airports';
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while fetching the list of airports';
        }
        return response;
    }

    async create(createAirportsDto: CreateAirportDto): Promise<any> {
        let response = { ...common_response };
        try {
            const newAirport = await this.airportRepository.save(createAirportsDto);
            response.success = true;
            response.message = 'Airport created successfully';
            response.data = newAirport;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while creating airport';
        }
        return response;
    }

    async findOne(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const airport = await this.airportRepository.findOneBy({ airportId: id });
            if (airport) {
                response.success = true;
                response.data = airport;
                response.message = 'Successfully retrieved airport information';
            } else {
                response.success = false;
                response.message = 'Airport not found';
            }
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving airport by ID';
        }
        return response;
    }

    async update(
        id: number,
        updateAirportDto: Partial<CreateAirportDto>,
    ): Promise<any> {
        let response = { ...common_response };
        try {
            const updateResult = await this.airportRepository.update(id, updateAirportDto);

            if (updateResult.affected && updateResult.affected > 0) {
                response.success = true;
                response.message = 'Airport updated successfully';
            } else {
                response.success = false;
                response.message = 'Airport not found or no changes made';
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while updating airport';
        }
        return response;
    }

    async delete(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const deleteResult = await this.airportRepository.delete({ airportId: id });
            if (deleteResult.affected && deleteResult.affected > 0) {
                response.success = true;
                response.message = 'Airport deleted successfully';
            } else {
                response.success = false;
                response.message = 'Airport not found';
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while deleting airport';
        }
        return response;
    }
}
