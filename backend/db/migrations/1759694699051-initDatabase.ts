import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1759694699051 implements MigrationInterface {
    name = 'InitDatabase1759694699051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Terminals\` (\`TerminalID\` int NOT NULL AUTO_INCREMENT, \`TerminalCode\` varchar(10) NOT NULL, \`TerminalName\` varchar(100) NULL, \`airportId\` int NULL, UNIQUE INDEX \`IDX_81b2eb3052211ec683682f6dd2\` (\`airportId\`, \`TerminalCode\`), PRIMARY KEY (\`TerminalID\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Airports\` (\`airportId\` int NOT NULL AUTO_INCREMENT, \`airportCode\` varchar(3) NOT NULL, \`airportName\` varchar(100) NOT NULL, \`city\` varchar(100) NOT NULL, \`country\` varchar(100) NOT NULL, \`timezone\` varchar(50) NULL, \`latitude\` decimal(10,8) NULL, \`longitude\` decimal(11,8) NULL, UNIQUE INDEX \`IDX_d240264be44244a5272539c2f4\` (\`airportCode\`), PRIMARY KEY (\`airportId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`FareHistory\` (\`fareHistoryId\` int NOT NULL AUTO_INCREMENT, \`travelClass\` enum ('Economy', 'Business', 'First') NOT NULL, \`oldPrice\` decimal(10,2) NOT NULL, \`newPrice\` decimal(10,2) NOT NULL, \`changedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reason\` text NULL, \`flightId\` int NULL, \`changedBy\` int NULL, PRIMARY KEY (\`fareHistoryId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Reviews\` (\`reviewId\` int NOT NULL AUTO_INCREMENT, \`rating\` int NOT NULL, \`comment\` text NULL, \`reviewDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isApproved\` tinyint NOT NULL DEFAULT 0, \`bookingId\` int NULL, \`userId\` int NULL, \`flightId\` int NULL, PRIMARY KEY (\`reviewId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Flights\` (\`flightId\` int NOT NULL AUTO_INCREMENT, \`flightNumber\` varchar(10) NOT NULL, \`departureTime\` datetime NOT NULL, \`arrivalTime\` datetime NOT NULL, \`duration\` int NOT NULL, \`status\` enum ('Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled') NOT NULL DEFAULT 'Scheduled', \`economyPrice\` decimal(10,2) NOT NULL, \`businessPrice\` decimal(10,2) NOT NULL, \`firstClassPrice\` decimal(10,2) NOT NULL, \`availableEconomySeats\` int NOT NULL, \`availableBusinessSeats\` int NOT NULL, \`availableFirstClassSeats\` int NOT NULL, \`airlineId\` int NULL, \`departureAirportId\` int NULL, \`arrivalAirportId\` int NULL, \`departureTerminalId\` int NULL, \`arrivalTerminalId\` int NULL, \`aircraftId\` int NULL, PRIMARY KEY (\`flightId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Airlines\` (\`airlineId\` int NOT NULL AUTO_INCREMENT, \`airlineCode\` varchar(3) NOT NULL, \`airlineName\` varchar(100) NOT NULL, \`logoURL\` varchar(255) NULL, \`contactNumber\` varchar(20) NULL, \`website\` varchar(100) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_fa87bcaa821a5559e13a79afdb\` (\`airlineCode\`), PRIMARY KEY (\`airlineId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Aircrafts\` (\`aircraftId\` int NOT NULL AUTO_INCREMENT, \`aircraftCode\` varchar(10) NOT NULL, \`model\` varchar(100) NOT NULL, \`economyCapacity\` int NOT NULL DEFAULT '0', \`businessCapacity\` int NOT NULL DEFAULT '0', \`firstClassCapacity\` int NOT NULL DEFAULT '0', \`seatLayoutJSON\` json NULL, \`lastMaintenance\` date NULL, \`nextMaintenance\` date NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`airlineId\` int NULL, UNIQUE INDEX \`IDX_bb45d52268df51d1160fef6994\` (\`aircraftCode\`), PRIMARY KEY (\`aircraftId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Seats\` (\`seatId\` int NOT NULL AUTO_INCREMENT, \`seatNumber\` varchar(10) NOT NULL, \`travelClass\` enum ('Economy', 'Business', 'First') NOT NULL, \`isAvailable\` tinyint NOT NULL DEFAULT 1, \`features\` json NULL, \`aircraftId\` int NULL, UNIQUE INDEX \`IDX_45799b2982cb303cb08ab0b307\` (\`aircraftId\`, \`seatNumber\`), PRIMARY KEY (\`seatId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`SeatAllocations\` (\`allocationId\` int NOT NULL AUTO_INCREMENT, \`BookingFlightId\` int NULL, \`seatId\` int NULL, \`passengerId\` int NULL, UNIQUE INDEX \`IDX_0eb2920dad0ea37e3c4907bc08\` (\`BookingFlightId\`, \`passengerId\`), UNIQUE INDEX \`IDX_dc0723e1776c14f8152408ef2e\` (\`BookingFlightId\`, \`seatId\`), PRIMARY KEY (\`allocationId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Passengers\` (\`passengerId\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(50) NOT NULL, \`lastName\` varchar(50) NOT NULL, \`dateOfBirth\` date NULL, \`passportNumber\` varchar(50) NULL, \`passengerType\` enum ('Adult', 'Child', 'Infant') NOT NULL DEFAULT 'Adult', \`bookingId\` int NULL, PRIMARY KEY (\`passengerId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CheckIns\` (\`checkInId\` int NOT NULL AUTO_INCREMENT, \`checkInType\` enum ('Online', 'Airport') NOT NULL, \`checkedInAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`boardingPassUrl\` varchar(255) NULL, \`baggageCount\` int NOT NULL DEFAULT '0', \`baggageWeight\` decimal(5,2) NOT NULL DEFAULT '0.00', \`boardingStatus\` enum ('NotBoarded', 'Boarded', 'GateClosed') NOT NULL DEFAULT 'NotBoarded', \`bookingFlightId\` int NULL, \`passengerId\` int NULL, PRIMARY KEY (\`checkInId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`BookingFlights\` (\`bookingFlightId\` int NOT NULL AUTO_INCREMENT, \`travelClass\` enum ('Economy', 'Business', 'First') NOT NULL, \`fare\` decimal(10,2) NOT NULL, \`seatNumber\` varchar(10) NULL, \`baggageAllowance\` int NOT NULL DEFAULT '0', \`bookingId\` int NULL, \`flightId\` int NULL, PRIMARY KEY (\`bookingFlightId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Payments\` (\`paymentId\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(12,2) NOT NULL, \`paymentMethod\` enum ('CreditCard', 'DebitCard', 'PayPal', 'BankTransfer') NOT NULL, \`paymentStatus\` enum ('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending', \`transactionId\` varchar(100) NULL, \`paymentDetails\` json NULL, \`paidAt\` datetime NULL, \`bookingId\` int NULL, PRIMARY KEY (\`paymentId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Bookings\` (\`bookingId\` int NOT NULL AUTO_INCREMENT, \`bookingReference\` varchar(10) NOT NULL, \`totalAmount\` decimal(12,2) NOT NULL, \`paymentStatus\` enum ('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending', \`bookingStatus\` enum ('Reserved', 'Confirmed', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Reserved', \`contactEmail\` varchar(100) NOT NULL, \`contactPhone\` varchar(20) NOT NULL, \`specialRequests\` text NULL, \`bookedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`IDX_0759fc177ee2cada2e903af026\` (\`bookingReference\`), PRIMARY KEY (\`bookingId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Notifications\` (\`notificationId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`type\` enum ('Booking', 'Flight', 'Payment', 'System') NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`RelatedId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`notificationId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Users\` (\`userId\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(100) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`firstName\` varchar(50) NOT NULL, \`lastName\` varchar(50) NOT NULL, \`phone\` varchar(20) NULL, \`dateOfBirth\` date NULL, \`passportNumber\` varchar(50) NULL, \`passportExpiry\` date NULL, \`roleId\` int NOT NULL DEFAULT '1', \`loyaltyPoints\` int NOT NULL DEFAULT '0', \`loyaltyTier\` enum ('Standard', 'Silver', 'Gold', 'Platinum') NOT NULL DEFAULT 'Standard', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`lastLogin\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` (\`email\`), PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`UserRoles\` (\`roleId\` int NOT NULL AUTO_INCREMENT, \`roleName\` varchar(50) NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b99aceded41da7ff6504e77da3\` (\`roleName\`), PRIMARY KEY (\`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Terminals\` ADD CONSTRAINT \`FK_b3c5ce557285feaaf8a9e1b79ae\` FOREIGN KEY (\`airportId\`) REFERENCES \`Airports\`(\`airportId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` ADD CONSTRAINT \`FK_c3dcd4063828d5cb00a4140fc63\` FOREIGN KEY (\`flightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` ADD CONSTRAINT \`FK_5ee5fa3a79e62ed808e5ce15d62\` FOREIGN KEY (\`changedBy\`) REFERENCES \`Users\`(\`userId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reviews\` ADD CONSTRAINT \`FK_e64b0a5d5b8e50991754788c24b\` FOREIGN KEY (\`bookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reviews\` ADD CONSTRAINT \`FK_03697b4cf2383ce44b9b0ac3fda\` FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reviews\` ADD CONSTRAINT \`FK_4530ee6282e0adbf5ce5f7911fa\` FOREIGN KEY (\`flightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_90bbbfb3604a0279e747e927483\` FOREIGN KEY (\`airlineId\`) REFERENCES \`Airlines\`(\`airlineId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_03b4847e08643b089ec6b02a3b1\` FOREIGN KEY (\`departureAirportId\`) REFERENCES \`Airports\`(\`airportId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_68a05fbc9f43b2f0db4e9822db3\` FOREIGN KEY (\`arrivalAirportId\`) REFERENCES \`Airports\`(\`airportId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_0e9fc8c15be47078f87ce9ba15d\` FOREIGN KEY (\`departureTerminalId\`) REFERENCES \`Terminals\`(\`TerminalID\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_6edaa0cf9d7df23ea0d92e8431f\` FOREIGN KEY (\`arrivalTerminalId\`) REFERENCES \`Terminals\`(\`TerminalID\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_10bc5553b9befba519f7c92e162\` FOREIGN KEY (\`aircraftId\`) REFERENCES \`Aircrafts\`(\`aircraftId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Aircrafts\` ADD CONSTRAINT \`FK_dd1175b227a1a287e792e095a46\` FOREIGN KEY (\`airlineId\`) REFERENCES \`Airlines\`(\`airlineId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Seats\` ADD CONSTRAINT \`FK_25c64a5e6c8d196381f8fcf6fe6\` FOREIGN KEY (\`aircraftId\`) REFERENCES \`Aircrafts\`(\`aircraftId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_1ea14cc4a562a919782fad0e186\` FOREIGN KEY (\`BookingFlightId\`) REFERENCES \`BookingFlights\`(\`bookingFlightId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_1c6e23f13a94b50b855b49231b4\` FOREIGN KEY (\`seatId\`) REFERENCES \`Seats\`(\`seatId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_44fc375a3a251889e1a4db276eb\` FOREIGN KEY (\`passengerId\`) REFERENCES \`Passengers\`(\`passengerId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Passengers\` ADD CONSTRAINT \`FK_61d5c4631ae9fbe146b96dc251c\` FOREIGN KEY (\`bookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` ADD CONSTRAINT \`FK_e93eb9413b4c1beb408e81e8f43\` FOREIGN KEY (\`bookingFlightId\`) REFERENCES \`BookingFlights\`(\`bookingFlightId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` ADD CONSTRAINT \`FK_9b8cbc56be052d2ab47f2b04d19\` FOREIGN KEY (\`passengerId\`) REFERENCES \`Passengers\`(\`passengerId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` ADD CONSTRAINT \`FK_369a816f1519279ff1cfbbf6a03\` FOREIGN KEY (\`bookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` ADD CONSTRAINT \`FK_222301cb8904584b470ce7a7605\` FOREIGN KEY (\`flightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Payments\` ADD CONSTRAINT \`FK_231b42ff1bd554331c084a3617e\` FOREIGN KEY (\`bookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Bookings\` ADD CONSTRAINT \`FK_9154ba42728899ce737b81fb694\` FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Notifications\` ADD CONSTRAINT \`FK_28a9de2f34e218f2ccc746ed4f7\` FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD CONSTRAINT \`FK_65c56db5a9988b90b0d7245e0f0\` FOREIGN KEY (\`roleId\`) REFERENCES \`UserRoles\`(\`roleId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` DROP FOREIGN KEY \`FK_65c56db5a9988b90b0d7245e0f0\``);
        await queryRunner.query(`ALTER TABLE \`Notifications\` DROP FOREIGN KEY \`FK_28a9de2f34e218f2ccc746ed4f7\``);
        await queryRunner.query(`ALTER TABLE \`Bookings\` DROP FOREIGN KEY \`FK_9154ba42728899ce737b81fb694\``);
        await queryRunner.query(`ALTER TABLE \`Payments\` DROP FOREIGN KEY \`FK_231b42ff1bd554331c084a3617e\``);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` DROP FOREIGN KEY \`FK_222301cb8904584b470ce7a7605\``);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` DROP FOREIGN KEY \`FK_369a816f1519279ff1cfbbf6a03\``);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` DROP FOREIGN KEY \`FK_9b8cbc56be052d2ab47f2b04d19\``);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` DROP FOREIGN KEY \`FK_e93eb9413b4c1beb408e81e8f43\``);
        await queryRunner.query(`ALTER TABLE \`Passengers\` DROP FOREIGN KEY \`FK_61d5c4631ae9fbe146b96dc251c\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_44fc375a3a251889e1a4db276eb\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_1c6e23f13a94b50b855b49231b4\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_1ea14cc4a562a919782fad0e186\``);
        await queryRunner.query(`ALTER TABLE \`Seats\` DROP FOREIGN KEY \`FK_25c64a5e6c8d196381f8fcf6fe6\``);
        await queryRunner.query(`ALTER TABLE \`Aircrafts\` DROP FOREIGN KEY \`FK_dd1175b227a1a287e792e095a46\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_10bc5553b9befba519f7c92e162\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_6edaa0cf9d7df23ea0d92e8431f\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_0e9fc8c15be47078f87ce9ba15d\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_68a05fbc9f43b2f0db4e9822db3\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_03b4847e08643b089ec6b02a3b1\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_90bbbfb3604a0279e747e927483\``);
        await queryRunner.query(`ALTER TABLE \`Reviews\` DROP FOREIGN KEY \`FK_4530ee6282e0adbf5ce5f7911fa\``);
        await queryRunner.query(`ALTER TABLE \`Reviews\` DROP FOREIGN KEY \`FK_03697b4cf2383ce44b9b0ac3fda\``);
        await queryRunner.query(`ALTER TABLE \`Reviews\` DROP FOREIGN KEY \`FK_e64b0a5d5b8e50991754788c24b\``);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` DROP FOREIGN KEY \`FK_5ee5fa3a79e62ed808e5ce15d62\``);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` DROP FOREIGN KEY \`FK_c3dcd4063828d5cb00a4140fc63\``);
        await queryRunner.query(`ALTER TABLE \`Terminals\` DROP FOREIGN KEY \`FK_b3c5ce557285feaaf8a9e1b79ae\``);
        await queryRunner.query(`DROP INDEX \`IDX_b99aceded41da7ff6504e77da3\` ON \`UserRoles\``);
        await queryRunner.query(`DROP TABLE \`UserRoles\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP TABLE \`Notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_0759fc177ee2cada2e903af026\` ON \`Bookings\``);
        await queryRunner.query(`DROP TABLE \`Bookings\``);
        await queryRunner.query(`DROP TABLE \`Payments\``);
        await queryRunner.query(`DROP TABLE \`BookingFlights\``);
        await queryRunner.query(`DROP TABLE \`CheckIns\``);
        await queryRunner.query(`DROP TABLE \`Passengers\``);
        await queryRunner.query(`DROP INDEX \`IDX_dc0723e1776c14f8152408ef2e\` ON \`SeatAllocations\``);
        await queryRunner.query(`DROP INDEX \`IDX_0eb2920dad0ea37e3c4907bc08\` ON \`SeatAllocations\``);
        await queryRunner.query(`DROP TABLE \`SeatAllocations\``);
        await queryRunner.query(`DROP INDEX \`IDX_45799b2982cb303cb08ab0b307\` ON \`Seats\``);
        await queryRunner.query(`DROP TABLE \`Seats\``);
        await queryRunner.query(`DROP INDEX \`IDX_bb45d52268df51d1160fef6994\` ON \`Aircrafts\``);
        await queryRunner.query(`DROP TABLE \`Aircrafts\``);
        await queryRunner.query(`DROP INDEX \`IDX_fa87bcaa821a5559e13a79afdb\` ON \`Airlines\``);
        await queryRunner.query(`DROP TABLE \`Airlines\``);
        await queryRunner.query(`DROP TABLE \`Flights\``);
        await queryRunner.query(`DROP TABLE \`Reviews\``);
        await queryRunner.query(`DROP TABLE \`FareHistory\``);
        await queryRunner.query(`DROP INDEX \`IDX_d240264be44244a5272539c2f4\` ON \`Airports\``);
        await queryRunner.query(`DROP TABLE \`Airports\``);
        await queryRunner.query(`DROP INDEX \`IDX_81b2eb3052211ec683682f6dd2\` ON \`Terminals\``);
        await queryRunner.query(`DROP TABLE \`Terminals\``);
    }

}
