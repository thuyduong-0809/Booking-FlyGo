import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSeatFromAllocation1733326800000 implements MigrationInterface {
    name = 'RemoveSeatFromAllocation1733326800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra xem foreign key có tồn tại không trước khi xóa
        const foreignKeys = await queryRunner.query(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'SeatAllocations' 
            AND COLUMN_NAME = 'seatId'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        // Xóa foreign key constraint nếu tồn tại
        if (foreignKeys.length > 0) {
            const constraintName = foreignKeys[0].CONSTRAINT_NAME;
            await queryRunner.query(`
                ALTER TABLE \`SeatAllocations\` 
                DROP FOREIGN KEY \`${constraintName}\`
            `);
        }

        // Kiểm tra xem column có tồn tại không trước khi xóa
        const columns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'SeatAllocations' 
            AND COLUMN_NAME = 'seatId'
        `);

        // Xóa column seatId nếu tồn tại
        if (columns.length > 0) {
            await queryRunner.query(`
                ALTER TABLE \`SeatAllocations\` 
                DROP COLUMN \`seatId\`
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback: thêm lại column seatId
        await queryRunner.query(`
            ALTER TABLE \`SeatAllocations\` 
            ADD COLUMN \`seatId\` INT NULL
        `);

        // Populate lại data từ flightSeat.seat
        await queryRunner.query(`
            UPDATE \`SeatAllocations\` sa
            JOIN \`FlightSeats\` fs ON sa.flightSeatId = fs.flightSeatId
            SET sa.seatId = fs.seatId
            WHERE sa.seatId IS NULL
        `);

        // Thêm lại foreign key constraint
        await queryRunner.query(`
            ALTER TABLE \`SeatAllocations\` 
            ADD CONSTRAINT \`FK_SeatAllocations_seatId\` 
            FOREIGN KEY (\`seatId\`) REFERENCES \`Seats\`(\`seatId\`) 
            ON DELETE CASCADE
        `);
    }
}
