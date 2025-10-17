import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAircraftDto } from 'src/aircrafts/dto/create-aicrafts.dto';
import { UpdateAircraftDto } from 'src/aircrafts/dto/update-aicrafts.dto';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Airline } from 'src/airlines/entities/airlines.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class AircraftsService {
    constructor(@InjectRepository(Aircraft) private aircraftRepository:Repository<Aircraft>,
                @InjectRepository(Airline) private airlineRepository: Repository<Airline>,) {}


        async findAll(): Promise<any> {
                let response = { ...common_response };
                try {
                    const aircrafts = await this.aircraftRepository.find({
                    relations: ['airline'],
                    select: ['aircraftId', 'aircraftCode', 'model', 'economyCapacity', 'businessCapacity', 'firstClassCapacity', 'seatLayoutJSON', 'lastMaintenance', 'nextMaintenance', 'isActive', 'airline'],
                    });
                    response.success = true;
                    response.data =  aircrafts;
                    response.message = 'Successfully retrieved the list of  aircrafts';
                } catch (error) {
                    console.error(error);
                    response.success = false;
                    response.message = 'Error while fetching the list of  aircrafts';
                }
                return response;
            }
    
    
            async create(createAircraftDto: CreateAircraftDto): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const existingAircraft = await this.aircraftRepository.findOne({ where: { aircraftCode:createAircraftDto.aircraftCode} });
                        if(existingAircraft){
                            response.success = false;
                            response.message = 'Aircraft existing';
                            response.errorCode = 'AIRCRAFT_EXISTS';
                        }
                        const airline = await this.airlineRepository.findOneBy({ airlineId: createAircraftDto.airlineId });
                        if (!airline) {
                            response.success = false;
                            response.message = 'Airline not found';
                            return response;
                        }
                        const newAircraft = this.aircraftRepository.create({
                            ...createAircraftDto,
                            airline: airline, 
                        });
                        await this.aircraftRepository.save(newAircraft);
                        response.success = true;
                        response.message = 'Aircraft created successfully';
                        response.data = newAircraft;
                    } catch (error) {
                        response.success = false;
                        response.message = error.message || 'Error while creating aircraft';
                    }
                    return response;
                }
            
                async findOne(id: number): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const aircraft = await this.aircraftRepository.findOne({
                            where: { aircraftId: id },
                            relations: ['airline'],
                        });
                        if (aircraft) {
                            response.success = true;
                            response.data =  aircraft;
                            response.message = 'Successfully retrieved aircraft information';
                        } else {
                            response.success = false;
                            response.message = ' Aircraft not found';
                        }
                    } catch (error) {
                        console.error(error);
                        response.success = false;
                        response.message = 'Error while retrieving  aircraft by ID';
                    }
                    return response;
                }

                async findByAirlineId(id: number): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const aicrafts = await this.aircraftRepository.find({
                        where: { airline: { airlineId: id } },
                        relations: ['airline'],
                        });

                        if(aicrafts.length > 0) {
                        response.success = true;
                        response.data = aicrafts;
                        response.message = 'Successfully retrieved aicrafts for this airline';
                        } else {
                        response.success = false;
                        response.message = 'No aicrafts found for this airline';
                        response.errorCode = 'AICRAFTS_EXISTS';
                        }
                    } catch (error) {
                        console.error(error);
                        response.success = false;
                        response.message = 'Error while retrieving aicraft by airline ID';
                    }
                    return response;
                    }

            
                async update(
                    id: number,
                    updateAircraftDto: UpdateAircraftDto,
                ): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const updateResult = await this.aircraftRepository.update(id, updateAircraftDto);
            
                        if (updateResult.affected && updateResult.affected > 0) {
                            response.success = true;
                            response.message = 'Aircraft updated successfully';
                        } else {
                            response.success = false;
                            response.message = 'Aircraft not found or no changes made';
                        }
                    } catch (error) {
                        response.success = false;
                        response.message = error.message || 'Error while updating aircraft';
                    }
                    return response;
                }
            
                async delete(id: number): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const deleteResult = await this.aircraftRepository.delete({aircraftId: id });
                        if (deleteResult.affected && deleteResult.affected > 0) {
                            response.success = true;
                            response.message = 'Aircraft deleted successfully';
                        } else {
                            response.success = false;
                            response.message = 'Aircraft not found';
                        }
                    } catch (error) {
                        response.success = false;
                        response.message = error.message || 'Error while deleting aircraft';
                    }
                    return response;
                }
}
