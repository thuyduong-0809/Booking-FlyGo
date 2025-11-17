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
    ) { }


    async findAll(): Promise<any> {
        let response = { ...common_response }
        try {
            const seats = await this.seatRepository.find({
                relations: ['aircraft']
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
            const seat = await this.seatRepository.findOne({
                where: { seatId: id },
                relations: ['aircraft'],
            });
            if (seat) {
                response.success = true;
                response.data = seat;
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
    async findOneSeatNumberByAircraft(aircraftId: number, seatNumber: string): Promise<any> {
        const response = { ...common_response };

        try {
            const seat = await this.seatRepository.findOne({
                where: {
                    seatNumber,
                    aircraft: { aircraftId }, // AND condition (đúng mong muốn)
                },
                relations: ['aircraft'],
            });

            if (seat) {
                response.success = true;
                response.data = seat;
                response.message = 'Successfully retrieved seat information';
            } else {
                response.success = false;
                response.message = 'Seat not found';
            }
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving seat by aircraft and seat number';
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

    /**
     * Bulk create seats - optimized for creating many seats at once
     */
    async createBulk(seatsData: Array<Omit<CreateSeatDto, 'aircraftId'> & { aircraftId: number }>): Promise<any> {
        const response = { ...common_response };
        try {
            // Group by aircraftId to optimize queries
            const aircraftIds = [...new Set(seatsData.map(s => s.aircraftId))];
            const aircraftsMap = new Map();

            for (const aircraftId of aircraftIds) {
                const aircraft = await this.aircraftRepository.findOne({ where: { aircraftId } });
                if (!aircraft) {
                    throw new NotFoundException(`Aircraft with ID ${aircraftId} not found`);
                }
                aircraftsMap.set(aircraftId, aircraft);
            }

            // Create seat entities
            const seats = seatsData.map(seatData => {
                const { aircraftId, ...rest } = seatData;
                return this.seatRepository.create({
                    ...rest,
                    aircraft: aircraftsMap.get(aircraftId),
                });
            });

            // Save in batches to prevent issues with large datasets
            const batchSize = 100;
            const savedSeats: Seat[] = [];
            for (let i = 0; i < seats.length; i += batchSize) {
                const batch = seats.slice(i, i + batchSize);
                const saved = await this.seatRepository.save(batch);
                savedSeats.push(...saved);
            }

            response.success = true;
            response.message = `Successfully created ${savedSeats.length} seats`;
            response.data = savedSeats;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while creating seats in bulk';
        }
        return response;
    }


    async findByAircraft(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const seats = await this.seatRepository.find({
                where: { aircraft: { aircraftId: id } },
                relations: ['aircraft'],
            });

            if (seats.length > 0) {
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

    async remove(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const seat = await this.seatRepository.findOne({
                where: { seatId: id },
            });

            if (!seat) {
                response.success = false;
                response.message = 'Seat not found';
                return response;
            }

            await this.seatRepository.remove(seat);
            response.success = true;
            response.message = 'Seat deleted successfully';
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while deleting seat';
        }
        return response;
    }

    /**
     * Reset auto-increment của seatId về 1
     * Xóa tất seats trước khi reset auto-increment
     */
    async resetSeatIdAutoIncrement(): Promise<any> {
        const response = { ...common_response };
        try {
            const maxSeatResult = await this.seatRepository.manager.query(
                'SELECT MAX(seatId) as maxId FROM Seats'
            );
            const maxSeatId = maxSeatResult[0]?.maxId || 0;

            await this.seatRepository.manager.query(
                'ALTER TABLE Seats AUTO_INCREMENT = 1'
            );

            response.success = true;
            response.message = `Auto-increment đã được reset về 1. Max seatId hiện tại: ${maxSeatId}`;
            response.data = { maxSeatId, newAutoIncrement: 1 };
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while resetting auto-increment';
        }
        return response;
    }

    /**
     * Reset all seatIds về 1
     */
    async resetAllSeatIds(): Promise<any> {
        const response = { ...common_response };
        try {
            const allSeats = await this.seatRepository.find({
                relations: ['aircraft'],
            });

            if (allSeats.length === 0) {
                response.success = true;
                response.message = 'Không có seats nào để reset';
                return response;
            }

            const oldAutoIncrementResult = await this.seatRepository.manager.query(
                "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Seats'"
            );
            const oldAutoIncrement = oldAutoIncrementResult[0]?.AUTO_INCREMENT || 1;

            await this.seatRepository.manager.query('SET FOREIGN_KEY_CHECKS = 0');

            try {
                await this.seatRepository.manager.query('DELETE FROM Seats');

                await this.seatRepository.manager.query('ALTER TABLE Seats AUTO_INCREMENT = 1');

                const autoIncrementResult = await this.seatRepository.manager.query(
                    "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Seats'"
                );
                const currentAutoIncrement = autoIncrementResult[0]?.AUTO_INCREMENT || 1;

                const verifyBeforeCreate = await this.seatRepository.manager.query(
                    "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Seats'"
                );
                if (verifyBeforeCreate[0]?.AUTO_INCREMENT !== 1) {
                    await this.seatRepository.manager.query('ALTER TABLE Seats AUTO_INCREMENT = 1');
                }

                // Tạo lại seats với ID mới (bắt đầu từ 1)
                const seatsToRecreate = allSeats.map((seat) => {
                    return this.seatRepository.create({
                        seatNumber: seat.seatNumber,
                        travelClass: seat.travelClass,
                        isAvailable: seat.isAvailable,
                        features: seat.features,
                        aircraft: seat.aircraft,
                    });
                });

                const batchSize = 100;
                const savedSeats: Seat[] = [];
                let firstSeatId: number | null = null;

                for (let i = 0; i < seatsToRecreate.length; i += batchSize) {
                    const batch = seatsToRecreate.slice(i, i + batchSize);
                    const saved = await this.seatRepository.save(batch);
                    savedSeats.push(...saved);

                    if (i === 0 && saved.length > 0) {
                        firstSeatId = saved[0].seatId;
                    }
                }

                const verifyResult = await this.seatRepository.manager.query(
                    'SELECT MIN(seatId) as minId, MAX(seatId) as maxId FROM Seats'
                );
                const minSeatId = verifyResult[0]?.minId || null;
                const maxSeatId = verifyResult[0]?.maxId || null;

                const finalAutoIncrementResult = await this.seatRepository.manager.query(
                    "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Seats'"
                );
                const finalAutoIncrement = finalAutoIncrementResult[0]?.AUTO_INCREMENT || 1;

                if (minSeatId !== 1) {
                    throw new Error(`SeatId không bắt đầu từ 1. Min seatId: ${minSeatId}`);
                }

                response.success = true;
                response.message = `Đã reset ${allSeats.length} seats. SeatId bắt đầu từ ${minSeatId}`;
                response.data = {
                    totalSeats: allSeats.length,
                    firstSeatId: minSeatId,
                    lastSeatId: maxSeatId,
                    oldAutoIncrement: oldAutoIncrement,
                    newAutoIncrement: finalAutoIncrement
                };
            } finally {
                await this.seatRepository.manager.query('SET FOREIGN_KEY_CHECKS = 1');
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while resetting all seat IDs';
        }
        return response;
    }




}
