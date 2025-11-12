import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFlightSeats1762916909534 implements MigrationInterface {
    name = 'CreateFlightSeats1762916909534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng FlightSeats
        await queryRunner.query(`
            CREATE TABLE \`FlightSeats\` (
                \`flightSeatId\` int NOT NULL AUTO_INCREMENT,
                \`isAvailable\` tinyint NOT NULL DEFAULT 1,
                \`flightId\` int NOT NULL,
                \`seatId\` int NOT NULL,
                PRIMARY KEY (\`flightSeatId\`),
                UNIQUE INDEX \`IDX_flight_seat_unique\` (\`flightId\`, \`seatId\`)
            ) ENGINE=InnoDB
        `);

        // Tạo foreign key constraint cho flightId
        await queryRunner.query(`
            ALTER TABLE \`FlightSeats\` 
            ADD CONSTRAINT \`FK_FlightSeats_flightId\` 
            FOREIGN KEY (\`flightId\`) 
            REFERENCES \`Flights\`(\`flightId\`) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // Tạo foreign key constraint cho seatId
        await queryRunner.query(`
            ALTER TABLE \`FlightSeats\` 
            ADD CONSTRAINT \`FK_FlightSeats_seatId\` 
            FOREIGN KEY (\`seatId\`) 
            REFERENCES \`Seats\`(\`seatId\`) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`FlightSeats\` 
            DROP FOREIGN KEY \`FK_FlightSeats_seatId\`
        `);

        await queryRunner.query(`
            ALTER TABLE \`FlightSeats\` 
            DROP FOREIGN KEY \`FK_FlightSeats_flightId\`
        `);

        // Xóa unique index
        await queryRunner.query(`
            DROP INDEX \`IDX_flight_seat_unique\` ON \`FlightSeats\`
        `);

        // Xóa bảng FlightSeats
        await queryRunner.query(`DROP TABLE \`FlightSeats\``);
    }
}

