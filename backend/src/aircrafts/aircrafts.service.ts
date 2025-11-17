import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAircraftDto } from 'src/aircrafts/dto/create-aicrafts.dto';
import { UpdateAircraftDto } from 'src/aircrafts/dto/update-aicrafts.dto';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Airline } from 'src/airlines/entities/airlines.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class AircraftsService {
    constructor(@InjectRepository(Aircraft) private aircraftRepository: Repository<Aircraft>,
        @InjectRepository(Airline) private airlineRepository: Repository<Airline>,
        @InjectRepository(Seat) private seatRepository: Repository<Seat>,
    ) { }

    /* Generate seats based on layout string (e.g., "3-3-3" means 3 seats left, 3 middle, 3 right = 9 seats per row)
    * Seat numbers format: F-1A, B-1A, E-1A (First, Business, Economy)
    * Seat letters: A, B, C, D, E, F, G, H, J, K (không có I)
    * Tạo từ trước → sau, từ trái → phải*/

    async resetAircraftIdAutoIncrement(): Promise<any> {
        const response = { ...common_response };
        try {
            const maxAircraftResult = await this.aircraftRepository.manager.query(
                'SELECT MAX(aircraftId) as maxId FROM Aircrafts'
            );
            const maxAircraftId = maxAircraftResult[0]?.maxId || 0;
            const autoIncrementResult = await this.aircraftRepository.manager.query(
                "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Aircrafts'"
            );
            const currentAutoIncrement = autoIncrementResult[0]?.AUTO_INCREMENT || 1;
            await this.aircraftRepository.manager.query(
                'ALTER TABLE Aircrafts AUTO_INCREMENT = 1'
            );
            const verifyResult = await this.aircraftRepository.manager.query(
                "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Aircrafts'"
            );
            const newAutoIncrement = verifyResult[0]?.AUTO_INCREMENT || 1;

            response.success = true;
            response.message = `Auto-increment đã được reset về 1. Max aircraftId hiện tại: ${maxAircraftId}`;
            response.data = {
                maxAircraftId,
                oldAutoIncrement: currentAutoIncrement,
                newAutoIncrement: newAutoIncrement
            };
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while resetting auto-increment';
            console.error('Error resetting aircraft auto-increment:', error);
        }
        return response;
    }

    private generateSeatsFromLayout(
        aircraft: Aircraft,
        travelClass: 'Economy' | 'Business' | 'First',
        totalCapacity: number,
        layoutString: string,
        features: object,
        startRow: number = 1, // Row bắt đầu cho hạng này
    ): any[] {
        const seats: any[] = [];
        // Seat letters: A, B, C, D, E, F, G, H, J, K (bỏ I)
        const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

        const classPrefix: Record<string, string> = {
            'Economy': 'E',
            'Business': 'B',
            'First': 'F',
        };
        const prefix = classPrefix[travelClass] || '';

        // Layout mặc định cho từng hạng
        const defaultLayouts: Record<string, number[]> = {
            'First': [1, 2, 1],      //  (4 ghế/hàng)
            'Business': [2, 2, 2],   //  (6 ghế/hàng)
            'Economy': [3, 3, 3],    //  (9 ghế/hàng)
        };

        let layoutParts: number[] = [];
        if (layoutString && layoutString.trim() !== '' && layoutString.trim() !== 'custom') {
            layoutParts = layoutString.split('-').map(part => parseInt(part.trim(), 10)).filter(num => !isNaN(num) && num > 0);
        }

        if (layoutParts.length === 0) {
            layoutParts = defaultLayouts[travelClass] || [3, 3, 3];
        } else {
        }

        const seatsPerRow = layoutParts.reduce((sum, num) => sum + num, 0);
        let seatIndex = 0;
        let currentRow = startRow;

        if (seatsPerRow === 0) {
            layoutParts = defaultLayouts[travelClass] || [3, 3, 3];
        }

        // Tạo seats theo layout
        while (seatIndex < totalCapacity) {
            let letterIndex = 0;

            // Tạo seats cho mỗi hàng theo layout (từ trái sang phải)
            for (let sectionIndex = 0; sectionIndex < layoutParts.length && seatIndex < totalCapacity; sectionIndex++) {
                const seatsInSection = layoutParts[sectionIndex];

                // Tạo seats trong section này (từ trái sang phải)
                for (let i = 0; i < seatsInSection && seatIndex < totalCapacity; i++) {
                    if (letterIndex >= seatLetters.length) {
                        const extraIndex = letterIndex - seatLetters.length;
                        seats.push({
                            aircraft,
                            seatNumber: `${prefix}-${currentRow}${seatLetters[seatLetters.length - 1]}${extraIndex + 1}`,
                            travelClass,
                            isAvailable: true,
                            features,
                        });
                    } else {
                        seats.push({
                            aircraft,
                            seatNumber: `${prefix}-${currentRow}${seatLetters[letterIndex]}`,
                            travelClass,
                            isAvailable: true,
                            features,
                        });
                    }
                    letterIndex++;
                    seatIndex++;
                }
            }
            currentRow++;
        }

        return seats;
    }

    async findAll(): Promise<any> {
        let response = { ...common_response };
        try {
            const aircrafts = await this.aircraftRepository.find({
                relations: ['airline'],
                select: ['aircraftId', 'aircraftCode', 'model', 'economyCapacity', 'businessCapacity', 'firstClassCapacity', 'seatLayoutJSON', 'lastMaintenance', 'nextMaintenance', 'isActive', 'airline'],
            });
            response.success = true;
            response.data = aircrafts;
            response.message = 'Successfully retrieved the list of  aircrafts';
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while fetching the list of  aircrafts';
        }
        return response;
    }

    async create(createAircraftDto: CreateAircraftDto): Promise<any> {
        const response = { ...common_response };
        try {
            const existingAircraft = await this.aircraftRepository.findOne({
                where: { aircraftCode: createAircraftDto.aircraftCode },
            });
            if (existingAircraft) {
                response.success = false;
                response.message = 'Aircraft already exists';
                response.errorCode = 'AIRCRAFT_EXISTS';
                return response;
            }

            const airline = await this.airlineRepository.findOneBy({
                airlineId: createAircraftDto.airlineId,
            });
            if (!airline) {
                response.success = false;
                response.message = 'Airline not found';
                return response;
            }

            const newAircraft = this.aircraftRepository.create({
                ...createAircraftDto,
                airline,
            });
            const savedAircraft = await this.aircraftRepository.save(newAircraft);

            // SeatLayout ở đây
            // Thứ tự: FIRST → BUSINESS → ECONOMY
            const allSeats: any[] = [];
            const seatLayout = createAircraftDto.seatLayoutJSON as any;

            let currentRow = 1; // Bắt đầu từ row 1

            // 1. Generate First Class seats (hàng đầu tiên)
            if (createAircraftDto.firstClassCapacity > 0) {
                const firstLayout = seatLayout?.layout?.First || '';
                const firstSeats = this.generateSeatsFromLayout(
                    savedAircraft,
                    'First',
                    createAircraftDto.firstClassCapacity,
                    firstLayout,
                    {
                        seatPitch: '78-83 inches',
                        hasUSB: true,
                        hasPowerOutlet: true,
                        isLieFlat: true,
                        hasPrivacyDoor: true,
                        entertainment: true,
                        mealService: 'Luxury',
                        amenityKit: true,
                    },
                    currentRow,
                );
                allSeats.push(...firstSeats);
                // Tính row tiếp theo cho Business
                let firstLayoutParts: number[] = [];
                if (firstLayout && firstLayout.trim() !== '' && firstLayout.trim() !== 'custom') {
                    firstLayoutParts = firstLayout.split('-').map((p: string) => parseInt(p.trim(), 10)).filter((n: number) => !isNaN(n) && n > 0);
                }
                const firstSeatsPerRow = firstLayoutParts.length > 0
                    ? firstLayoutParts.reduce((sum: number, num: number) => sum + num, 0)
                    : 4; // Default cho First: 1-2-1 = 4 ghế/hàng
                currentRow += Math.ceil(createAircraftDto.firstClassCapacity / firstSeatsPerRow);
            }

            // 2. Generate Business seats (hàng tiếp theo)
            if (createAircraftDto.businessCapacity > 0) {
                const businessLayout = seatLayout?.layout?.Business || '';
                const businessSeats = this.generateSeatsFromLayout(
                    savedAircraft,
                    'Business',
                    createAircraftDto.businessCapacity,
                    businessLayout,
                    {
                        seatPitch: '38-42 inches',
                        hasUSB: true,
                        hasPowerOutlet: true,
                        hasRecline: true,
                        isLieFlat: false,
                        entertainment: true,
                        mealService: 'Premium',
                    },
                    currentRow,
                );
                allSeats.push(...businessSeats);
                // Tính row tiếp theo cho Economy
                let businessLayoutParts: number[] = [];
                if (businessLayout && businessLayout.trim() !== '' && businessLayout.trim() !== 'custom') {
                    businessLayoutParts = businessLayout.split('-').map((p: string) => parseInt(p.trim(), 10)).filter((n: number) => !isNaN(n) && n > 0);
                }
                const businessSeatsPerRow = businessLayoutParts.length > 0
                    ? businessLayoutParts.reduce((sum: number, num: number) => sum + num, 0)
                    : 6; // Default cho Business: 2-2-2 = 6 ghế/hàng
                currentRow += Math.ceil(createAircraftDto.businessCapacity / businessSeatsPerRow);
            }

            // 3. Generate Economy seats (hàng cuối cùng)
            if (createAircraftDto.economyCapacity > 0) {
                const economyLayout = seatLayout?.layout?.Economy || '';
                const economySeats = this.generateSeatsFromLayout(
                    savedAircraft,
                    'Economy',
                    createAircraftDto.economyCapacity,
                    economyLayout,
                    {
                        seatPitch: '30-32 inches',
                        hasUSB: true,
                        hasPowerOutlet: false,
                        hasRecline: true,
                        isExtraLegroom: false,
                        entertainment: false,
                    },
                    currentRow,
                );
                allSeats.push(...economySeats);
            }

            //  Save tất cả seats trong batch để tránh issue seatId và tăng performance
            if (allSeats.length > 0) {
                await this.seatRepository.manager.query('SET FOREIGN_KEY_CHECKS = 0');

                try {
                    const existingSeats = await this.seatRepository.find({
                        where: { aircraft: { aircraftId: savedAircraft.aircraftId } },
                    });

                    if (existingSeats.length > 0) {
                        await this.seatRepository.delete({
                            aircraft: { aircraftId: savedAircraft.aircraftId },
                        });

                        const remainingSeats = await this.seatRepository.count();
                        if (remainingSeats === 0) {
                            await this.seatRepository.manager.query(
                                'ALTER TABLE Seats AUTO_INCREMENT = 1'
                            );
                        } else {
                            const maxSeatResult = await this.seatRepository.manager.query(
                                'SELECT MAX(seatId) as maxId FROM Seats'
                            );
                            const maxSeatId = maxSeatResult[0]?.maxId || 0;
                            const nextId = maxSeatId + 1;
                            await this.seatRepository.manager.query(
                                `ALTER TABLE Seats AUTO_INCREMENT = ${nextId}`
                            );
                        }
                    }

                    // Kiểm tra duplicate trong allSeats trước khi save
                    const seatNumberMap = new Map<string, boolean>();
                    const uniqueSeats: any[] = [];

                    for (const seat of allSeats) {
                        const seatKey = `${savedAircraft.aircraftId}-${seat.seatNumber}`;
                        if (!seatNumberMap.has(seatKey)) {
                            seatNumberMap.set(seatKey, true);
                            uniqueSeats.push(seat);
                        } else {
                        }
                    }

                    // Lưu trong các batch nhỏ để tránh issue với dữ liệu lớn và tối ưu việc tạo seatId
                    const batchSize = 100;
                    for (let i = 0; i < uniqueSeats.length; i += batchSize) {
                        const batch = uniqueSeats.slice(i, i + batchSize);
                        try {
                            await this.seatRepository.save(batch);
                        } catch (error) {
                            for (const seat of batch) {
                                try {
                                    // Kiểm tra xem seat đã tồn tại chưa
                                    const existing = await this.seatRepository.findOne({
                                        where: {
                                            aircraft: { aircraftId: savedAircraft.aircraftId },
                                            seatNumber: seat.seatNumber,
                                        },
                                    });
                                    if (!existing) {
                                        await this.seatRepository.save(seat);
                                    } else {
                                    }
                                } catch (seatError: any) {
                                }
                            }
                        }
                    }
                } finally {
                    // Bật lại foreign key checks
                    await this.seatRepository.manager.query('SET FOREIGN_KEY_CHECKS = 1');
                }
            }

            response.success = true;
            response.message = 'Aircraft created successfully';
            response.data = savedAircraft;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while creating aircraft';
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

    async findOne(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const aircraft = await this.aircraftRepository.findOne({
                where: { aircraftId: id },
                relations: ['airline'],
            });
            if (aircraft) {
                response.success = true;
                response.data = aircraft;
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

            if (aicrafts.length > 0) {
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




    async delete(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const deleteResult = await this.aircraftRepository.delete({ aircraftId: id });
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
