import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Airport } from 'src/airports/entities/airports.entity';
import { CreateTerminalDto } from 'src/terminals/dto/create-terminal.dto';
import { UpdateTerminalDto } from 'src/terminals/dto/update-terminal';
import { Terminal } from 'src/terminals/entities/terminals.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class TerminalsService {
    constructor(@InjectRepository(Terminal) private terminalRepository:Repository<Terminal>,
                @InjectRepository(Airport) private airportRepository: Repository<Airport>,) {}

    


    
        async findAll(): Promise<any> {
            let response = { ...common_response };
            try {
                const terminals = await this.terminalRepository.find({
                relations: ['airport'],
                select: ['terminalId', 'terminalCode', 'terminalName', 'airport'],
            });
    
                response.success = true;
                response.data = terminals;
                response.message = 'Successfully retrieved the list of terminals';
            } catch (error) {
                console.error(error);
                response.success = false;
                response.message = 'Error while fetching the list of terminals';
            }
            return response;
        }


         async create(createTerminalsDto: CreateTerminalDto): Promise<any> {
                let response = { ...common_response };
                try {
                    const airport = await this.airportRepository.findOneBy({ airportId: createTerminalsDto.airportId });
                    if (!airport) {
                        response.success = false;
                        response.message = 'Airport not found';
                        return response;
                    }
                    const newTerminal = this.terminalRepository.create({
                        ...createTerminalsDto,
                        airport: airport, 
                    });
                    await this.terminalRepository.save(newTerminal);
                    response.success = true;
                    response.message = 'Terminal created successfully';
                    response.data = newTerminal;
                } catch (error) {
                    response.success = false;
                    response.message = error.message || 'Error while creating terminal';
                }
                return response;
            }
        
            async findOne(id: number): Promise<any> {
                let response = { ...common_response };
                try {
                    const terminal = await this.terminalRepository.findOne({
                        where: { terminalId: id },
                        relations: ['airport'],
                    });
                    if (terminal) {
                        response.success = true;
                        response.data = terminal;
                        response.message = 'Successfully retrieved terminal information';
                    } else {
                        response.success = false;
                        response.message = 'Terminal not found';
                    }
                } catch (error) {
                    console.error(error);
                    response.success = false;
                    response.message = 'Error while retrieving terminal by ID';
                }
                return response;
            }

            async findByAirportId(id: number): Promise<any> {
                let response = { ...common_response };
                try {
                    const terminals = await this.terminalRepository.find({
                    where: { airport: { airportId: id } },
                    relations: ['airport'],
                    });

                    if (terminals.length > 0) {
                    response.success = true;
                    response.data = terminals;
                    response.message = 'Successfully retrieved terminals for this airport';
                    } else {
                    response.success = false;
                    response.message = 'No terminals found for this airport';
                    response.errorCode = 'TERMINAL_EXISTS';
                    }
                } catch (error) {
                    console.error(error);
                    response.success = false;
                    response.message = 'Error while retrieving terminal by airport ID';
                }
                return response;
                }

        
        
            async update(
                id: number,
                 updateTerminalDto: UpdateTerminalDto,
            ): Promise<any> {
                let response = { ...common_response };
                try {
                    const updateResult = await this.terminalRepository.update(id, updateTerminalDto);
        
                    if (updateResult.affected && updateResult.affected > 0) {
                        response.success = true;
                        response.message = 'Terminal updated successfully';
                    } else {
                        response.success = false;
                        response.message = 'Terminal not found or no changes made';
                    }
                } catch (error) {
                    response.success = false;
                    response.message = error.message || 'Error while updating terminal';
                }
                return response;
            }
        
            async delete(id: number): Promise<any> {
                let response = { ...common_response };
                try {
                    const deleteResult = await this.terminalRepository.delete({terminalId: id });
                    if (deleteResult.affected && deleteResult.affected > 0) {
                        response.success = true;
                        response.message = 'Terminal deleted successfully';
                    } else {
                        response.success = false;
                        response.message = 'Terminal not found';
                    }
                } catch (error) {
                    response.success = false;
                    response.message = error.message || 'Error while deleting terminal';
                }
                return response;
            }
}
