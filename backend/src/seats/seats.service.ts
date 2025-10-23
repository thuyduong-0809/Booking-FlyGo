import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { CreateSeatDto } from 'src/seats/dto/create-seat.dto';
import { UpdateSeatDto } from 'src/seats/dto/update-seat.fto';
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

                async findOne(id: number): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const seat= await this.seatRepository.findOne({
                            where: { seatId: id },
                            relations: ['aircraft'],
                        });
                        if (seat) {
                            response.success = true;
                            response.data =  seat;
                            response.message = 'Successfully retrieved seat information';
                        } else {
                            response.success = false;
                            response.message = ' seat not found';
                        }
                    } catch (error) {
                        console.error(error);
                        response.success = false;
                        response.message = 'Error while retrieving  seat by ID';
                    }
                    return response;
                }
                
                async findOneSeatNumberByAircraft(aircraftId:number,seatNumber: string): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const seat= await this.seatRepository.findOne({
                            where: [{seatNumber},{aircraft:{aircraftId}}],
                            relations: ['aircraft'],
                        });
                        if (seat) {
                            response.success = true;
                            response.data =  seat;
                            response.message = 'Successfully retrieved seat information';
                        } else {
                            response.success = false;
                            response.message = ' seat not found';
                        }
                    } catch (error) {
                        console.error(error);
                        response.success = false;
                        response.message = 'Error while retrieving  seat by ID';
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


                async findByAircraft(id: number): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const seats = await this.seatRepository.find({
                        where: { aircraft: { aircraftId: id } },
                        relations: ['aircraft'],
                        });

                        if(seats.length > 0) {
                        response.success = true;
                        response.data = seats;
                        response.message = 'Successfully retrieved seats for this aircraft';
                        } else {
                        response.success = false;
                        response.message = 'No seats found for this aircraft';
                        response.errorCode = 'SEATS_EXISTS';
                        }
                    } catch (error) {
                        console.error(error);
                        response.success = false;
                        response.message = 'Error while retrieving aicraft by aircraft ID';
                    }
                    return response;
                    }

                async update(
                    id: number,
                    updateSeatDto: UpdateSeatDto,
                ): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const updateResult = await this.seatRepository.update(id, updateSeatDto);
            
                        if (updateResult.affected && updateResult.affected > 0) {
                            response.success = true;
                            response.message = 'Seat updated successfully';
                        } else {
                            response.success = false;
                            response.message = 'Seat not found or no changes made';
                        }
                    } catch (error) {
                        response.success = false;
                        response.message = error.message || 'Error while updating seat';
                    }
                    return response;
                }                
   


    

}
