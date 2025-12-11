import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCancelledByToString1765476128465 implements MigrationInterface {
    name = 'ChangeCancelledByToString1765476128465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_58e0eed771c331c94381ee186ad\` ON \`FlightSeats\``);
        await queryRunner.query(`DROP INDEX \`FK_f26d27d29b53a1d01b68e2a20c7\` ON \`SeatAllocations\``);
        await queryRunner.query(`DROP INDEX \`FK_a528c2f057a6503cf1408fd29f5\` ON \`CancelHistory\``);
        await queryRunner.query(`DROP INDEX \`FK_c7212ce9efb3613282d9ee754e5\` ON \`CancelHistory\``);
        await queryRunner.query(`DROP INDEX \`FK_591ed6f779747a3abb70d79250c\` ON \`RefundHistory\``);
        await queryRunner.query(`DROP INDEX \`FK_cf3691f749e05210f150d7d1187\` ON \`RefundHistory\``);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` DROP COLUMN \`cancelledByName\``);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`cancellationFee\` \`cancellationFee\` decimal(12,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`refundAmount\` \`refundAmount\` decimal(12,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`cancelledAt\` \`cancelledAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` DROP COLUMN \`cancelledBy\``);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` ADD \`cancelledBy\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`bookingId\` \`bookingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` CHANGE \`requestedAt\` \`requestedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` CHANGE \`processedAt\` \`processedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` CHANGE \`bookingId\` \`bookingId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_63b2d28455cceea6fe14c40b02\` ON \`FlightSeats\` (\`flightId\`, \`seatId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_6f093e7496b248946d4e5ef84f\` ON \`SeatAllocations\` (\`BookingFlightId\`, \`flightSeatId\`)`);
        await queryRunner.query(`ALTER TABLE \`FlightSeats\` ADD CONSTRAINT \`FK_a17382a026e5967a22a4cb7803f\` FOREIGN KEY (\`flightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`FlightSeats\` ADD CONSTRAINT \`FK_58e0eed771c331c94381ee186ad\` FOREIGN KEY (\`seatId\`) REFERENCES \`Seats\`(\`seatId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_f26d27d29b53a1d01b68e2a20c7\` FOREIGN KEY (\`flightSeatId\`) REFERENCES \`FlightSeats\`(\`flightSeatId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` ADD CONSTRAINT \`FK_a528c2f057a6503cf1408fd29f5\` FOREIGN KEY (\`bookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` ADD CONSTRAINT \`FK_591ed6f779747a3abb70d79250c\` FOREIGN KEY (\`bookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` ADD CONSTRAINT \`FK_cf3691f749e05210f150d7d1187\` FOREIGN KEY (\`processedBy\`) REFERENCES \`Users\`(\`userId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` DROP FOREIGN KEY \`FK_cf3691f749e05210f150d7d1187\``);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` DROP FOREIGN KEY \`FK_591ed6f779747a3abb70d79250c\``);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` DROP FOREIGN KEY \`FK_a528c2f057a6503cf1408fd29f5\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_f26d27d29b53a1d01b68e2a20c7\``);
        await queryRunner.query(`ALTER TABLE \`FlightSeats\` DROP FOREIGN KEY \`FK_58e0eed771c331c94381ee186ad\``);
        await queryRunner.query(`ALTER TABLE \`FlightSeats\` DROP FOREIGN KEY \`FK_a17382a026e5967a22a4cb7803f\``);
        await queryRunner.query(`DROP INDEX \`IDX_6f093e7496b248946d4e5ef84f\` ON \`SeatAllocations\``);
        await queryRunner.query(`DROP INDEX \`IDX_63b2d28455cceea6fe14c40b02\` ON \`FlightSeats\``);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` CHANGE \`bookingId\` \`bookingId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` CHANGE \`processedAt\` \`processedAt\` datetime(6) NULL ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` CHANGE \`requestedAt\` \`requestedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`bookingId\` \`bookingId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` DROP COLUMN \`cancelledBy\``);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` ADD \`cancelledBy\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`cancelledAt\` \`cancelledAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`refundAmount\` \`refundAmount\` decimal(12,2) NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` CHANGE \`cancellationFee\` \`cancellationFee\` decimal(12,2) NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`CancelHistory\` ADD \`cancelledByName\` varchar(255) COLLATE "utf8mb4_unicode_ci" NULL`);
        await queryRunner.query(`CREATE INDEX \`FK_cf3691f749e05210f150d7d1187\` ON \`RefundHistory\` (\`processedBy\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_591ed6f779747a3abb70d79250c\` ON \`RefundHistory\` (\`bookingId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_c7212ce9efb3613282d9ee754e5\` ON \`CancelHistory\` (\`cancelledBy\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_a528c2f057a6503cf1408fd29f5\` ON \`CancelHistory\` (\`bookingId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_f26d27d29b53a1d01b68e2a20c7\` ON \`SeatAllocations\` (\`flightSeatId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_58e0eed771c331c94381ee186ad\` ON \`FlightSeats\` (\`seatId\`)`);
    }

}
